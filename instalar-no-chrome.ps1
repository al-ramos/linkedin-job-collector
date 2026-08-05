$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$extensionPath = Join-Path $projectRoot 'extensao-linkedin'
$manifestPath = Join-Path $extensionPath 'manifest.json'

if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "manifest.json não encontrado em: $extensionPath"
}

Set-Clipboard -Value $extensionPath
Start-Process explorer.exe -ArgumentList "/select,`"$manifestPath`""

try {
    Start-Process chrome.exe -ArgumentList 'chrome://extensions'
} catch {
    Start-Process 'chrome://extensions'
}

Write-Host ''
Write-Host 'Instalador preparado.' -ForegroundColor Green
Write-Host 'O caminho da extensão foi copiado:' -ForegroundColor Cyan
Write-Host $extensionPath
Write-Host ''
Write-Host 'No Chrome:'
Write-Host '1. Ative Modo do desenvolvedor.'
Write-Host '2. Clique em Carregar sem compactação.'
Write-Host '3. Cole o caminho copiado e selecione a pasta.'
Write-Host ''
Write-Host 'O Chrome exige essa confirmação manual por segurança.' -ForegroundColor Yellow
Read-Host 'Pressione Enter para fechar'
