# 실행: powershell -File auto-backup.ps1
# 5분마다 src 폴더 전체를 백업합니다
$backupRoot = "backups"
while ($true) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    $dest = Join-Path $backupRoot "src_$ts"
    Copy-Item "src" $dest -Recurse -Force
    Write-Host "[BACKUP] $ts - saved to $dest"
    # 10개 초과시 오래된 백업 삭제
    $all = Get-ChildItem $backupRoot -Directory | Sort-Object Name -Descending
    if ($all.Count -gt 10) {
        $all | Select-Object -Skip 10 | ForEach-Object { Remove-Item $_.FullName -Recurse -Force; Write-Host "[CLEANUP] Removed $($_.Name)" }
    }
    Start-Sleep -Seconds 300
}
