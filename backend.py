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

@app.route("/statusHistory")
def statusHistory():

    cur = get_db().cursor()

    selected = "week"
    time = 0
    if selected == "day":
        time = 24*60*60
    elif selected == "week":
        time = 24*60*60*7
    elif selected == "month":
        time = 24*60*60*30
    elif selected == "year":
        time = 24*60*60*365

    cur.execute("""SELECT count(id),
       avg(works),
       date
FROM (SELECT *,
             CASE WHEN status_code == 200 THEN 1 ELSE 0 END AS works,
             round(unixepoch(date) / ?/90)                   AS category
      FROM measurements
      WHERE unixepoch(date('now')) - unixepoch(date) < ?)
GROUP BY category""", (time, time))
    results = []
    for row in cur.fetchall():
        results.append(dict(row))
    response = jsonify(results)
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