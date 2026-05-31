import requests
import os
from dotenv import load_dotenv

load_dotenv()

class TelegramNotifier:

    def __init__(self):

        # NEW VALID TOKEN
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN")

        self.chat_id = os.getenv ("TELEGRAM_CHAT_ID")

    def send_alert(self, message):

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"

        payload = {
            "chat_id": self.chat_id,
            "text": message
        }

        try:

            response = requests.post(url, data=payload)
            result = response.json()

            if not result.get("ok"):
                print("[ERROR] Telegram failed:", result)

            return result

        except Exception as e:
            print("[ERROR] Telegram request failed:", str(e))
            return None
