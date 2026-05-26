import hashlib

SEEN_STORAGE = set()
SEEN_TELEGRAM = set()


def generate_alert_key(alert):

    key = (
        alert.get("alert_type", "") +
        alert.get("username", "") +
        alert.get("source_ip", "") +
        str(alert.get("timestamp", ""))
    )

    return hashlib.md5(key.encode()).hexdigest()


def is_duplicate(alert, stage="storage"):

    key = generate_alert_key(alert)

    if stage == "storage":

        if key in SEEN_STORAGE:
            return True

        SEEN_STORAGE.add(key)
        return False

    elif stage == "telegram":

        if key in SEEN_TELEGRAM:
            return True

        SEEN_TELEGRAM.add(key)
        return False

    return False
