import requests


class TelegramNotifier:

    def __init__(self):

        self.bot_token = "8618495049:AAFHuNOEhTnw5pgNCkP5Rte0awP6KsX7N7E"

        self.chat_id = "5969036385"

    def send_alert(self, message):

        url = (
            f"https://api.telegram.org/bot"
            f"{self.bot_token}/sendMessage"
        )

        payload = {

            "chat_id": self.chat_id,

            "text": message
        }

        response = requests.post(
            url,
            json=payload
        )

        return response.json()
