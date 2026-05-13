from urllib.parse import unquote

from database.db import ElasticsearchConnector


class ThreatHunter:

    def __init__(self):

        self.db = ElasticsearchConnector()

    # =========================
    # DISPLAY RESULTS
    # =========================
    def display_results(self, response):

        if not response:

            print("[ERROR] No response from Elasticsearch")

            return

        hits = response.get(
            "hits",
            {}
        ).get(
            "hits",
            []
        )

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

    # =========================
    # SMART HUNT QUERY
    # =========================
    def hunt_query(self, query):

        query = unquote(query)

        searches = [

            self.db.search_by_alert_type(query),

            self.db.search_by_username(query),

            self.db.search_by_ip(query),

            self.db.search_by_severity(query)

        ]

        for response in searches:

            if response:

                hits = response.get(
                    "hits",
                    {}
                ).get(
                    "hits",
                    []
                )

                if hits:
                    return response

        return None

    # =========================
    # MAIN CLI LOOP
    # =========================
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

            # =========================
            # SEARCH BY SEVERITY
            # =========================
            if choice == "1":

                severity = input("Severity: ")

                response = self.db.search_by_severity(
                    severity
                )

                self.display_results(response)

            # =========================
            # SEARCH BY IP
            # =========================
            elif choice == "2":

                ip = input("IP Address: ")

                response = self.db.search_by_ip(
                    unquote(ip)
                )

                self.display_results(response)

            # =========================
            # SEARCH BY USERNAME
            # =========================
            elif choice == "3":

                username = input("Username: ")

                response = self.db.search_by_username(
                    unquote(username)
                )

                self.display_results(response)

            # =========================
            # SEARCH BY ALERT TYPE
            # =========================
            elif choice == "4":

                alert_type = input("Alert Type: ")

                response = self.db.search_by_alert_type(
                    alert_type
                )

                self.display_results(response)

            # =========================
            # RECENT ALERTS
            # =========================
            elif choice == "5":

                response = self.db.get_recent_alerts()

                self.display_results(response)

            # =========================
            # SMART HUNT
            # =========================
            elif choice == "6":

                query = input("Hunt Query: ")

                response = self.hunt_query(query)

                self.display_results(response)

            # =========================
            # EXIT
            # =========================
            elif choice == "7":

                print("[INFO] Exiting Threat Hunter")

                break

            else:

                print("[ERROR] Invalid option")


if __name__ == "__main__":

    hunter = ThreatHunter()

    hunter.run()
