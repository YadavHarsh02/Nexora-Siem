"""Threat hunt CLI — run: python hunt.py"""

from siem.services.hunter import ThreatHunter


def main():
    ThreatHunter().run()


if __name__ == "__main__":
    main()
