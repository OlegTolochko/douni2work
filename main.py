import time

import requests
import sqlite3
import os

import config
def measure():

    # Change directory to correct directory
    if config.DATABASE_LOCATION == ":":
        print("Please specify a database location with DATABASE_LOCATION")
    os.chdir(config.DATABASE_LOCATION)

    response_google = requests.get("https://www.google.com")
    baseline_time = response_google.elapsed.total_seconds()

    if not response_google.ok:
        print("Request for baseline-time failed")
        return
    try:
        response_uni2work = requests.get('https://uni2work.ifi.lmu.de/', timeout=30)
        status_code = response_uni2work.status_code
        response_time = response_uni2work.elapsed.total_seconds()

    except requests.exceptions.Timeout as e:
        print("Timeout!")
        status_code = None
        response_time = None


    conn = sqlite3.connect('data.sqlite')

    cursor = conn.cursor()

    cursor.execute("INSERT INTO measurements (response_time, type, baseline_time, status_code, date) VALUES (?, ?, ?,?, "
                   "strftime('%s', datetime('now')));", (response_time, "LANDING_PAGE",baseline_time, status_code))
    cursor.close()
    conn.commit()
    conn.close()


if __name__ == "__main__":
    measure()