from datetime import datetime
import time
import subprocess


def run_pipeline():

print(
    f"\n[{datetime.now()}] "
    f"Running SIEM pipeline...\n"
)
    subprocess.run(
        ["python", "main.py"],
        input="1\n",
        text=True
    )

    subprocess.run(
        ["python", "main.py"],
        input="2\n",
        text=True
    )

    subprocess.run(
        ["python", "main.py"],
        input="3\n",
        text=True
    )


def main():

    print("=" * 50)
    print(" REAL-TIME MINI SIEM ")
    print("=" * 50)

    while True:

        run_pipeline()

        print(
            "\n[INFO] Waiting for new logs..."
        )

        time.sleep(30)


if __name__ == "__main__":

    main()
