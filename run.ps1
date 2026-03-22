cd C:\Users\user\Desktop\dev\packive
Write-Host "=== Appending Gamma Insight ===" -ForegroundColor Cyan
$existing = Get-Content "packive dev rules.md" -Raw -Encoding UTF8
$nl = [Environment]::NewLine
$s = $nl + "---" + $nl + $nl
$s += "## Gamma Article Insight - Product Growth Principles (2026-03-22)" + $nl + $nl
$s += "> Source: Lenny Podcast - Inside the rise of Gamma" + $nl + $nl
$s += "### Principle 1: First 30 Seconds Magic" + $nl
$s += "- Gamma rebuilt entire product for 3-4 months focusing on new user first experience" + $nl
$s += "- Packive: Box select -> dimensions -> dieline instant -> AI design, must create WOW in 30sec" + $nl
$s += "- Ask before every feature: Does this improve the first 30 second experience?" + $nl + $nl
$s += "### Principle 2: Vanity vs Core Growth Metrics" + $nl
$s += "- Vanity: total signups, press coverage, SNS likes" + $nl
$s += "- Core: revisit rate, organic referral ratio, word-of-mouth new users" + $nl
$s += "- Packive Core Metrics: dieline-to-design completion rate, PDF export rate, 7-day revisit rate" + $nl
$s += "- Key question: Do users come back, and do they bring others?" + $nl + $nl
$s += "### Principle 3: Real PMF Signal" + $nl
$s += "- Real PMF: product grows by itself without any marketing" + $nl
$s += "- Fake growth: spending ad budget to cover real problems" + $nl
$s += "- If product does not spread by itself, rebuild the product, not increase marketing" + $nl
$s += "- Packive: confirm organic growth signal before any paid ads" + $nl + $nl
$s += "### Principle 4: Micro-Community Strategy" + $nl
$s += "- 1 big influencer < dozens of trusted small communities" + $nl
$s += "- Validate by engagement rate (3-5%) not follower count" + $nl
$s += "- Users must tell product story in their own voice" + $nl
$s += "- Packive target: small brand owners, Amazon/Coupang sellers, small packaging manufacturers, startup founders" + $nl
$s += "- Goal: organic word-of-mouth - Finished box design in 5 min with Packive" + $nl + $nl
$s += "### Principle 5: Small Team Big Impact" + $nl
$s += "- Gamma: 50 employees, ARR 100M USD" + $nl
$s += "- Efficient operation with AI and automation over aggressive hiring" + $nl
$s += "- Packive: EasyPackMaker API for 654 templates (no manual dev), AI design generation, automate everything possible" + $nl + $nl
$s += "### Principle 6: Find Direction from Criticism" + $nl
$s += "- Worst idea ever feedback became starting point for realistic differentiation" + $nl
$s += "- Acknowledge competitors (Adobe AI, Esko ArtiosCAD) but focus on differentiation" + $nl
$s += "- Packive differentiator: print-ready package design in 5 min without professional knowledge" + $nl + $nl
$s += "### Dev Checklist (check before every feature)" + $nl
$s += "- [ ] Does this improve the first 30 second experience?" + $nl
$s += "- [ ] Does this increase revisit rate?" + $nl
$s += "- [ ] Does this trigger word-of-mouth? (shareable output?)" + $nl
$s += "- [ ] Can we deliver same value more simply without this feature?" + $nl
$s += "- [ ] Did we automate everything automatable?" + $nl
$full = $existing + $s
[System.IO.File]::WriteAllText("$PWD\packive dev rules.md", $full, [System.Text.UTF8Encoding]::new($false))
$lc = ($full -split "`n").Count
Write-Host "[OK] Updated: $lc lines" -ForegroundColor Green
git add -A
git commit -m "docs: add Gamma growth principles to dev rules"
git log --oneline -3
