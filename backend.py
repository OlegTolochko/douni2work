import time

from flask import Flask, g, current_app, jsonify
import sqlite3

app = Flask(__name__)


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            "data.sqlite",
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


@app.route("/statusHistory/<timespan>")
def statusHistory(timespan):
    cur = get_db().cursor()

    time = seconds_in_timespan(timespan)

    cur.execute("""SELECT count(id) as datapoints,
       avg(works) as uptime,
       date,
       category
FROM (SELECT *,
             CASE WHEN status_code == 200 THEN 1 ELSE 0 END    AS works,
             round((unixepoch(datetime('now')) - unixepoch(date)) / (?/90))                   AS category
      FROM measurements
      WHERE category < 90)
GROUP BY category
ORDER BY category""", (time,))

    results = [None] * 90
    for row in cur.fetchall():
        results[int(row["category"])] = dict(row)
    response = jsonify(list(reversed(results)))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


def seconds_in_timespan(timespan):
    time = 0
    if timespan == "day":
        time = 24 * 60 * 60
    elif timespan == "week":
        time = 24 * 60 * 60 * 7
    elif timespan == "month":
        time = 24 * 60 * 60 * 30
    elif timespan == "year":
        time = 24 * 60 * 60 * 365
    return time


@app.route("/responseTimes/<timespan>")
def responseTimes(timespan):
    cur = get_db().cursor()

    seconds = seconds_in_timespan(timespan)

    cur.execute("""SELECT avg(response_time) as response_time,
       round(avg(unixepoch(date))) as timestamp,
       round((unixepoch(datetime('now')) - unixepoch(date)) / (? / 90)) as ind
FROM measurements
WHERE ind < 90
GROUP BY ind;""", (seconds,))

    results = [None]*90
    for row in cur.fetchall():
        results[int(row["ind"])] = dict(row)
    for pos in range(len(results)):
        if results[pos] is None:
            results[pos] = {
                'timestamp': int(time.time() - (seconds / 90) * pos),
                'response_time': None
            }

    response = jsonify(results)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/isOnline")
def isOnline():
    cur = get_db().cursor()

    result = cur.execute("SELECT status_code, response_time, date FROM measurements ORDER BY date LIMIT 1")

    response = jsonify(dict(cur.fetchall()[0]))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/")
def root():
    cur = get_db().cursor()
    cur.execute("SELECT * FROM measurements")
    results = []
    for row in cur.fetchall():
        results.append(dict(row))
    return jsonify(results)
