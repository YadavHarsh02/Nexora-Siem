def test_core_imports():
    from siem.config import get_settings
    from siem.detection.engine import DetectionEngine
    from apps.api.main import app

    settings = get_settings()
    assert settings.raw_logs_dir.name == "raw"
    assert app.title == "Nexora SIEM API"
