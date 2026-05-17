# start-claude-deepseek.ps1
# 터미널 2: 반복 작업용 — DeepSeek V4 (DeepSeek 공식 Anthropic 호환 엔드포인트)

$ErrorActionPreference = "Stop"

# ── DeepSeek 라우팅 (Anthropic 호환 엔드포인트) ────────────
$env:ANTHROPIC_BASE_URL        = "https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN      = $env:DEEPSEEK_API_KEY
$env:ANTHROPIC_MODEL           = "deepseek-chat"
$env:ANTHROPIC_SMALL_FAST_MODEL = "deepseek-chat"

# ── API 키 확인 ────────────────────────────────────────────
if (-not $env:DEEPSEEK_API_KEY) {
    Write-Host ""
    Write-Host "[경고] DEEPSEEK_API_KEY 환경변수가 없습니다." -ForegroundColor Yellow
    Write-Host "       https://platform.deepseek.com/api_keys 에서 발급 후 시스템 환경변수에 등록하세요." -ForegroundColor Yellow
    Write-Host "       또는 이 세션에서:" -ForegroundColor Yellow
    Write-Host "         `$env:DEEPSEEK_API_KEY = 'sk-...'" -ForegroundColor Gray
    Write-Host ""
    return
}

# ── Anthropic 키와 충돌 방지 (DeepSeek 라우팅 시 무시되도록) ─
# Claude Code는 ANTHROPIC_AUTH_TOKEN을 먼저 사용하므로 ANTHROPIC_API_KEY는 그대로 둬도 무방.
# 다만 명확히 하기 위해 비워둠.
Remove-Item Env:\ANTHROPIC_API_KEY -ErrorAction SilentlyContinue

# ── 배너 ───────────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  CLAUDE CODE — 반복 작업 (DeepSeek V4)"      -ForegroundColor Magenta
Write-Host "  Endpoint: api.deepseek.com/anthropic"        -ForegroundColor Magenta
Write-Host "  Model:    deepseek-chat"                     -ForegroundColor Magenta
Write-Host "  CWD: $(Get-Location)"                        -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# ── Claude Code 실행 ───────────────────────────────────────
claude --permission-mode acceptEdits @args
