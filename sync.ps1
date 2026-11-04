$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Notion 部落格一鍵自動同步工具"

Clear-Host
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🚀 正在向 Notion 抓取最新文章並更新本地 HTML..." -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

node sync.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Yellow
    Write-Host "   📦 正在自動打包並推送至 GitHub Pages..." -ForegroundColor Yellow
    Write-Host "========================================================`n" -ForegroundColor Yellow

    git add .
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "自動同步 Notion 文章 ($now)"
    git push

    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "   🎉 大功告成！Notion 文章已成功同步並推送到網站上線！" -ForegroundColor Green
    Write-Host "========================================================`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ 同步失敗，請檢查 Notion 設定或網路連線。" -ForegroundColor Red
}

Write-Host "按 Enter 鍵關閉視窗..." -ForegroundColor Gray
Read-Host
