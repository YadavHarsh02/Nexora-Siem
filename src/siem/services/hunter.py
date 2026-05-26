from urllib.parse import unquote

from siem.database.db import ElasticsearchConnector


class ThreatHunter:

    def __init__(self, db: ElasticsearchConnector | None = None):

        self.db = db or ElasticsearchConnector()

    def hunt_query(self, query: str):

        query = unquote(query)

        searches = [
            self.db.search_by_alert_type(query),
            self.db.search_by_username(query),
            self.db.search_by_ip(query),
            self.db.search_by_severity(query),
        ]

        for response in searches:

            if not response:
                continue

            hits = response.get("hits", {}).get("hits", [])

            if hits:
                return response

        return None

    def display_results(self, response):

        if not response:

            print("[ERROR] No response from Elasticsearch")
            return

        hits = response.get("hits", {}).get("hits", [])

        if not hits:

            print("[INFO] No results found")
            return

        print("\n" + "=" * 50)
        print(" THREAT HUNT RESULTS ")
        print("=" * 50)

        for i, hit in enumerate(hits, start=1):

            alert = hit.get("_source", {})

            print(f"\nResult #{i}")

            for key, value in alert.items():
                print(f"{key}: {value}")

    def run(self):

        while True:

            print("\n" + "=" * 50)
            print(" THREAT HUNT CONSOLE ")
            print("=" * 50)

            print("\n1. Search by severity")
            print("2. Search by IP")
            print("3. Search by username")
            print("4. Search by alert type")
            print("5. Show recent alerts")
            print("6. Smart Hunt Query")
            print("7. Exit")

            choice = input("\nSelect option: ")

            if choice == "1":

                severity = input("Severity: ")
                self.display_results(self.db.search_by_severity(severity))

            elif choice == "2":

                ip = input("IP Address: ")
                self.display_results(self.db.search_by_ip(unquote(ip)))

            elif choice == "3":

                username = input("Username: ")
                self.display_results(self.db.search_by_username(unquote(username)))

            elif choice == "4":

                alert_type = input("Alert Type: ")
                self.display_results(self.db.search_by_alert_type(alert_type))

            elif choice == "5":

                self.display_results(self.db.get_recent_alerts())

            elif choice == "6":

                query = input("Hunt Query: ")
                self.display_results(self.hunt_query(query))

            elif choice == "7":

                print("[INFO] Exiting Threat Hunter")
                break

            else:
                print("[ERROR] Invalid option")
