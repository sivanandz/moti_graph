<#
.SYNOPSIS
    Delegates scene editing to interactive OpenCode TUI.
.DESCRIPTION
    Launches an interactive OpenCode session focused on a specific Remotion scene
    or Three.js component, passing relevant instructions and context.
.PARAMETER ScenePath
    Path to the React/Remotion component file (e.g. src/scenes/Beat1_Intro.tsx).
.PARAMETER Prompt
    Specific instructions for what OpenCode should modify or implement.
.PARAMETER Standalone
    Whether to run opencode in standalone mode.
#>
param (
    [Parameter(Mandatory=$false)]
    [string]$ScenePath = "",

    [Parameter(Mandatory=$false)]
    [string]$Prompt = "Refine this Vox-style Remotion scene with smooth animations and clean typography.",

    [switch]$Headless
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command opencode -ErrorAction SilentlyContinue)) {
    Write-Error "OpenCode CLI ('opencode') was not found on PATH. Ensure it is installed via npm or your package manager."
    exit 1
}

$FullPrompt = $Prompt
if ($ScenePath -and (Test-Path $ScenePath)) {
    $FullPrompt = "Focus on '$ScenePath': $Prompt"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " [OpenCode Delegator] Launching Handoff..." -ForegroundColor Cyan
Write-Host " Target File: $ScenePath" -ForegroundColor Yellow
Write-Host " Prompt: $Prompt" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

if ($Headless) {
    Write-Host "Running OpenCode in headless mode..." -ForegroundColor Green
    & opencode run --prompt "$FullPrompt"
} else {
    Write-Host "Spawning interactive OpenCode TUI in a new window..." -ForegroundColor Green
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "opencode --prompt `"$FullPrompt`""
}
