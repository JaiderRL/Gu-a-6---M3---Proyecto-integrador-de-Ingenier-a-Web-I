# Regenera docs/Documentacion-Proyecto-Lumen.pdf a partir de documentacion.html usando Microsoft Edge.
# Uso: abre PowerShell en esta carpeta y ejecuta:  powershell -ExecutionPolicy Bypass -File .\generar-pdf.ps1
$aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $aqui 'documentacion.html'
$pdf  = Join-Path (Split-Path -Parent $aqui) 'Documentacion-Proyecto-Lumen.pdf'
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$perfil = Join-Path $env:TEMP 'lumen-pdf-perfil'
$url = 'file:///' + ($html -replace '\\', '/')
Start-Process -Wait -FilePath $edge -ArgumentList '--headless=new', '--disable-gpu', "--user-data-dir=$perfil", '--no-pdf-header-footer', '--virtual-time-budget=8000', "--print-to-pdf=`"$pdf`"", $url
Write-Host "PDF generado en: $pdf"
