$projectRoot = $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Get-Location }
$backupRoot = Join-Path $projectRoot "backups"

while ($true) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    $dest = Join-Path $backupRoot "FULL_PROJECT_$ts"
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    
    # src 전체
    Copy-Item -Path (Join-Path $projectRoot "src") -Destination (Join-Path $dest "src") -Recurse -Force
    # public
    $pub = Join-Path $projectRoot "public"
    if (Test-Path $pub) { Copy-Item -Path $pub -Destination (Join-Path $dest "public") -Recurse -Force }
    # 설정 파일
    @("package.json","package-lock.json","tsconfig.json","next.config.js","next.config.mjs","next.config.ts",".env",".env.local",".gitignore","tailwind.config.js","tailwind.config.ts","postcss.config.js","postcss.config.mjs","components.json") | ForEach-Object {
        $f = Join-Path $projectRoot $_
        if (Test-Path $f) { Copy-Item $f (Join-Path $dest $_) -Force }
    }
    
    $fc = (Get-ChildItem $dest -Recurse -File | Measure-Object).Count
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] FULL BACKUP: $dest ($fc files)"
    
    # 최근 10개만 유지, 나머지 삭제
    $allBackups = Get-ChildItem $backupRoot -Directory -Filter "FULL_PROJECT_*" | Sort-Object Name -Descending
    if ($allBackups.Count -gt 10) {
        $allBackups | Select-Object -Skip 10 | ForEach-Object {
            Remove-Item $_.FullName -Recurse -Force
            Write-Host "[CLEANUP] Removed: $($_.Name)"
        }
    }
    
    Start-Sleep -Seconds 300
}
