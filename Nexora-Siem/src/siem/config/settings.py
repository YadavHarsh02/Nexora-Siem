from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import yaml

# mini-siem/src/siem/config/settings.py -> project root is 3 levels up
PROJECT_ROOT = Path(__file__).resolve().parents[3]


@dataclass(frozen=True)
class Settings:
    project_root: Path
    app_name: str
    debug: bool
    raw_logs_dir: Path
    parsed_logs_dir: Path
    labeled_logs_dir: Path
    exports_dir: Path
    threat_intel_file: Path
    logs_dir: Path
    log_file: Path
    dashboard_export_file: Path
    brute_force_attempts: int
    correlation_window_minutes: int


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    config_path = PROJECT_ROOT / "config" / "settings.yaml"

    with open(config_path, encoding="utf-8") as file:
        data = yaml.safe_load(file) or {}

    paths = data.get("paths", {})
    thresholds = data.get("thresholds", {})
    app = data.get("app", {})

    raw = PROJECT_ROOT / paths.get("raw_logs", "data/raw")
    parsed = PROJECT_ROOT / paths.get("parsed_logs", "data/parsed")
    labeled = PROJECT_ROOT / paths.get("labeled_logs", "data/labeled")
    exports = PROJECT_ROOT / "data" / "exports"
    logs = PROJECT_ROOT / "logs"

    return Settings(
        project_root=PROJECT_ROOT,
        app_name=app.get("name", "mini-siem"),
        debug=bool(app.get("debug", False)),
        raw_logs_dir=raw,
        parsed_logs_dir=parsed,
        labeled_logs_dir=labeled,
        exports_dir=exports,
        threat_intel_file=PROJECT_ROOT / "data" / "threat_intel" / "malicious_ips.txt",
        logs_dir=logs,
        log_file=logs / "siem.log",
        dashboard_export_file=exports / "dashboard_data.json",
        brute_force_attempts=int(thresholds.get("brute_force_attempts", 5)),
        correlation_window_minutes=int(
            thresholds.get("correlation_window_minutes", 10)
        ),
    )
