import requests


class TelegramNotifier:

    def __init__(self):

        # NEW VALID TOKEN
        self.bot_token = "8618495049:AAHw7RXC-wdv9DEbVhMTV3E52fXPtI_hjGk"

        self.chat_id = "5969036385"

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
