# PNG 시퀀스 → MP4 변환 (ffmpeg-static 사용)
# Usage: powershell -File frames-to-mp4.ps1

$ffmpeg = 'C:\Users\user\Desktop\dev\packive\node_modules\ffmpeg-static\ffmpeg.exe'
$framesDir = 'C:\Users\user\Desktop\dev\packive\backups\box360_frames'
$outMp4 = 'C:\Users\user\Desktop\dev\packive\public\models\packive-box-360.mp4'
$fps = 24

if (-not (Test-Path $ffmpeg)) {
    Write-Error "ffmpeg not found: $ffmpeg"
    exit 1
}

$frameCount = (Get-ChildItem $framesDir -Filter 'frame_*.png' -ErrorAction SilentlyContinue).Count
Write-Output "Frames available: $frameCount"
if ($frameCount -lt 2) {
    Write-Error "Need at least 2 frames"
    exit 1
}

# 출력 디렉토리 보장
$outDir = Split-Path $outMp4 -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

# 기존 mp4 삭제
if (Test-Path $outMp4) { Remove-Item $outMp4 -Force }

# ffmpeg 변환
& $ffmpeg `
    -y `
    -framerate $fps `
    -i "$framesDir\frame_%04d.png" `
    -c:v libx264 `
    -pix_fmt yuv420p `
    -crf 18 `
    -preset medium `
    -movflags +faststart `
    $outMp4 2>&1 | Select-Object -Last 10

if (Test-Path $outMp4) {
    $sz = (Get-Item $outMp4).Length
    Write-Output ""
    Write-Output "MP4 created: $outMp4"
    Write-Output "Size: $($sz) bytes ($([math]::Round($sz/1024,1)) KB)"
    Write-Output "Duration: $([math]::Round($frameCount/$fps, 2))s @ ${fps}fps"
} else {
    Write-Error "MP4 creation failed"
    exit 1
}
