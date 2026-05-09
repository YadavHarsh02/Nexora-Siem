from flask import Flask
from flask import render_template

import json
import os

app = Flask(__name__)


@app.route("/")

def home():

    data_file = (
        "dashboard/static/dashboard_data.json"
    )

    if not os.path.exists(data_file):

        return (
            "No dashboard data found. "
            "Run detection engine first."
        )

    with open(data_file, "r") as file:

        dashboard_data = json.load(file)

    return render_template(
        "index.html",
        alerts=dashboard_data["alerts"],
        attack_chains=dashboard_data[
            "attack_chains"
        ],
        ml_analysis=dashboard_data[
            "ml_analysis"
        ]
    )


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
