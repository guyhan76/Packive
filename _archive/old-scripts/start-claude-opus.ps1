# start-claude-opus.ps1
# 터미널 1: 핵심 작업용 — Claude Opus 4.7 (1M context) + 자동 편집 승인

$ErrorActionPreference = "Stop"

# ── 모델 설정 ──────────────────────────────────────────────
$env:ANTHROPIC_MODEL = "claude-opus-4-7[1m]"

# ── API 키 확인 ────────────────────────────────────────────
if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host ""
    Write-Host "[경고] ANTHROPIC_API_KEY 환경변수가 없습니다." -ForegroundColor Yellow
    Write-Host "       시스템 환경변수에 등록하거나, 이 세션에서:" -ForegroundColor Yellow
    Write-Host "         `$env:ANTHROPIC_API_KEY = 'sk-ant-...'" -ForegroundColor Gray
    Write-Host ""
    return
}

# ── 배너 ───────────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLAUDE CODE — 핵심 작업 (Opus 4.7 / 1M)"   -ForegroundColor Cyan
Write-Host "  Permission: acceptEdits"                     -ForegroundColor Cyan
Write-Host "  CWD: $(Get-Location)"                        -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ── Claude Code 실행 ───────────────────────────────────────
claude --permission-mode acceptEdits @args
