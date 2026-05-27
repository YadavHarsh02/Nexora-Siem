import os
from pathlib import Path

from fastapi import APIRouter, Depends, Request
from fastapi.responses import PlainTextResponse

from siem.config import get_settings

router = APIRouter(prefix="/api/v1/connector", tags=["connector"])


def _elastic_host() -> str:
    url = os.getenv("ELASTIC_URL", "").rstrip("/")
    if url.startswith("https://"):
        return url
    return f"https://{url}"


@router.get("/winlogbeat.yml", response_class=PlainTextResponse)
def download_winlogbeat(
    request: Request,
):
    """
    Download Winlogbeat config that:
    - ships logs directly to your Elastic Cloud cluster
    - tags every event with nexora_user_id = dev_user
    """
    settings = get_settings()
    template_path = (
        settings.project_root
        / "connectors"
        / "winlogbeat"
        / "winlogbeat.yml.template"
    )

    if not template_path.exists():
        raise FileNotFoundError("Winlogbeat template missing")

    template = template_path.read_text(encoding="utf-8")
    api_key = os.getenv("ELASTICSEARCH_API", "")

    rendered = template.format(
        elastic_host=_elastic_host(),
        elastic_api_key=api_key,
        nexora_user_id="dev_user",
        events_index=os.getenv("NEXORA_EVENTS_INDEX", "nexora-events"),
    )

    return PlainTextResponse(
        content=rendered,
        media_type="text/yaml",
        headers={
            "Content-Disposition": (
                'attachment; filename="nexora-winlogbeat-dev_user.yml"'
            )
        },
    )
