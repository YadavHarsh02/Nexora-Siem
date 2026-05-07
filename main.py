import yaml

def load_config():
    with open("config/settings.yaml", "r") as file:
        return yaml.safe_load(file)

def main():
    config = load_config()

    print("=" * 50)
    print(" MINI SIEM STARTED ")
    print("=" * 50)

    print(f"App Name : {config['app']['name']}")
    print(f"Debug Mode : {config['app']['debug']}")

if __name__ == "__main__":
    main()
