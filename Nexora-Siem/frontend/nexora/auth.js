/**
 * Connector download for Nexora SIEM (Authentication disabled).
 */

function getConfig() {
  return (
    window.NEXORA_CONFIG || {
      API_URL: "http://127.0.0.1:8000",
    }
  );
}

async function downloadConnector() {
  const config = getConfig();
  try {
    const response = await fetch(
      `${config.API_URL}/api/v1/connector/winlogbeat.yml`
    );

    if (!response.ok) {
      alert("Download failed. Is the API running?");
      return;
    }

    const yaml = await response.text();
    const blob = new Blob([yaml], { type: "text/yaml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "winlogbeat.yml";
    link.click();
  } catch (error) {
    console.error("Connector download error:", error);
    alert("Download failed. Is the API running?");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("downloadConnectorBtn");
  if (btn) {
    btn.addEventListener("click", downloadConnector);
  }
});
