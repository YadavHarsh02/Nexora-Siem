import yaml
from collectors.file_collector import FileCollector


def load_config():
    with open("config/settings.yaml", "r") as file:
        return yaml.safe_load(file)


def main():

    print("=" * 50)
    print(" MINI SIEM STARTED ")
    print("=" * 50)

    collector = FileCollector()

    print("\n1. Batch Collection")
    print("2. Real-Time Monitoring")

    choice = input("\nSelect mode: ")

    if choice == "1":

        collected_file = collector.collect_batch()

        if collected_file:
            print(f"[SUCCESS] Collected file: {collected_file}")

    elif choice == "2":

        collector.follow_log()

    else:
        print("[ERROR] Invalid option")


if __name__ == "__main__":
    main()
