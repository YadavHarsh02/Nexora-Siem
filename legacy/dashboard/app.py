from flask import Flask
from flask import render_template


app = Flask(
    __name__,
    static_folder="static",
    template_folder="templates"
)


# =========================
# DASHBOARD HOME
# =========================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# =========================
# RUN DASHBOARD
# =========================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )
