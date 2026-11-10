<#
.SYNOPSIS
    Controls Remotion preview and production MP4 rendering.
.PARAMETER Action
    'preview' to open Remotion Studio, or 'render' to output final MP4.
.PARAMETER Composition
    The Remotion composition ID (default: MainExplainer).
.PARAMETER OutFile
    Output video path when rendering (default: out/final_video.mp4).
#>
param (
    [ValidateSet("preview", "render")]
    [string]$Action = "preview",

    [string]$Composition = "VoxExplainer-EN",

    [string]$OutFile = "out/vox_explainer.mp4"
)

$ErrorActionPreference = "Stop"

if ($Action -eq "preview") {
    Write-Host "[Remotion] Launching Remotion Studio Preview..." -ForegroundColor Cyan
    npx remotion preview
} elseif ($Action -eq "render") {
    $OutDir = Split-Path $OutFile -Parent
    if ($OutDir -and -not (Test-Path $OutDir)) {
        New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
    }
    Write-Host "[Remotion] Rendering $Composition to $OutFile..." -ForegroundColor Green
    npx remotion render $Composition $OutFile --concurrency=4
}
