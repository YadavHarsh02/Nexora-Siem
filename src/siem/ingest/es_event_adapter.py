from __future__ import annotations

from typing import Any

from siem.parsers.auth_parser import AuthLogParser


def elastic_doc_to_detection_event(doc: dict[str, Any]) -> dict[str, Any] | None:
    """
    Convert a Winlogbeat/ECS document from Elasticsearch into the format
    expected by DetectionEngine (linux auth style when possible).
    """
    message = doc.get("message") or doc.get("log", {}).get("original", "")
    if isinstance(message, str) and message.strip():
        parsed = AuthLogParser().parse_line(message)
        if parsed:
            return parsed

    winlog = doc.get("winlog", {}) if isinstance(doc.get("winlog"), dict) else {}
    event_data = winlog.get("event_data", {}) if isinstance(winlog, dict) else {}

    event_id = winlog.get("event_id")
    event_type = "windows_event"
    if event_id == 4625:
        event_type = "failed_login"
    elif event_id == 4624:
        event_type = "successful_login"

    return {
        "event_type": event_type,
        "timestamp": doc.get("@timestamp", "unknown"),
        "username": (
            doc.get("user", {}).get("name")
            if isinstance(doc.get("user"), dict)
            else event_data.get("TargetUserName")
            or event_data.get("SubjectUserName")
            or "unknown"
        ),
        "source_ip": (
            doc.get("source", {}).get("ip")
            if isinstance(doc.get("source"), dict)
            else event_data.get("IpAddress")
            or "unknown"
        ),
        "message": message or str(event_id or "windows"),
    }
