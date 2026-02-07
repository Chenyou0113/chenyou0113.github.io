# 🌐 個人作品集網站

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://chenyou0113.github.io)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

這是一個使用純 HTML、CSS 和 JavaScript 構建的個人作品集網站，部署在 GitHub Pages 上。

## 📋 目錄

- [功能特色](#功能特色)
- [網站結構](#網站結構)
- [技術棧](#技術棧)
- [安裝與使用](#安裝與使用)
- [頁面說明](#頁面說明)
- [自定義指南](#自定義指南)
- [部署說明](#部署說明)
- [瀏覽器支援](#瀏覽器支援)
- [未來計劃](#未來計劃)
- [授權協議](#授權協議)

## ✨ 功能特色

- 🎨 **現代化設計** - 簡潔優雅的用戶界面
- 📱 **完全響應式** - 適配各種設備和螢幕尺寸
- 🌈 **流暢動畫** - 精美的進場和互動動畫效果
- 🎯 **易於導航** - 側邊欄固定導航，方便訪問各個頁面
- 📝 **聯絡表單** - 內建表單驗證和提交功能
- 🔝 **返回頂部** - 智能顯示的快速返回按鈕
- 💡 **深色模式** - 支持明暗主題切換（JavaScript 功能）
- ⚡ **高性能** - 無需框架，快速載入
- 🎭 **互動效果** - 豐富的懸停和點擊效果

## 📁 網站結構

```
cy245577.github.io/
├── index.html          # 首頁
├── about.html          # 關於我頁面
├── projects.html       # 專案展示頁面
├── friends.html        # 朋友友站頁面
├── contact.html        # 聯絡表單頁面
├── styles.css          # 統一樣式表（可選使用）
├── script.js           # 互動腳本
└── README.md           # 專案說明文件
```

## 🛠️ 技術棧

### 前端技術
- **HTML5** - 語義化標籤，結構清晰
- **CSS3** - 現代化樣式，包含：
  - CSS Variables（CSS 變數）
  - Flexbox 和 Grid 佈局
  - 動畫和過渡效果
  - 媒體查詢（響應式設計）
- **JavaScript (ES6+)** - 原生 JavaScript，包含：
  - DOM 操作
  - 事件處理
  - 表單驗證
  - 本地存儲
  - Intersection Observer API

### 設計特色
- 扁平化設計風格
- 卡片式佈局
- 漸變色背景
- 柔和的陰影效果
- 平滑的動畫過渡

## 🚀 安裝與使用

### 方法一：直接訪問線上版本
訪問：[https://chenyou0113.github.io](https://chenyou0113.github.io)

### 方法二：本地運行

1. **克隆倉庫**
   ```bash
   git clone https://github.com/Chenyou0113/chenyou0113.github.io.git
   cd chenyou0113.github.io
   ```

2. **打開網站**
   - 直接用瀏覽器打開 `index.html`
   - 或使用本地服務器：
     ```bash
     # 使用 Python 3
     python -m http.server 8000
     
     # 使用 Node.js (需先安裝 http-server)
     npx http-server
     ```

3. **在瀏覽器中訪問**
   ```
   http://localhost:8000
   ```

## 📄 頁面說明

### 🏠 首頁 (index.html)
- 個人簡介卡片
- 技能標籤展示
- 精選專案預覽
- 快速聯絡按鈕

### 👤 關於我 (about.html)
- 個人背景介紹
- 興趣愛好
- 技能樹展示
- 座右銘
- 聯絡方式

### 📁 專案 (projects.html)
- 專案卡片網格佈局
- 專案詳細描述
- 技術標籤
- 項目連結（GitHub 等）
- 開發狀態標示

### 🤝 朋友友站 (friends.html)
- 友站卡片展示
- 朋友資訊介紹
- 技能標籤
- 外部連結
- 申請加入區塊

### 📮 聯絡我 (contact.html)
- 多種聯絡方式展示
- 互動式表單
- 即時表單驗證
- 社交媒體連結
- 回覆時間說明

## 🎨 自定義指南

### 修改個人資訊

1. **更新個人資料**
   在 `index.html` 中修改：
   ```html
   <h1>你的名字</h1>
   <p>👋 你的簡介</p>
   ```

2. **更改頭像**
   替換圖片 URL：
   ```html
   <img src="你的頭像URL" alt="你的名字" class="profile-img">
   ```

3. **修改聯絡資訊**
   更新郵箱和 GitHub 連結：
   ```html
   <a href="mailto:your@email.com">發送郵件</a>
   <a href="https://github.com/yourusername">我的 GitHub</a>
   ```

### 自定義主題顏色

在每個 HTML 文件的 `<style>` 區塊或 `styles.css` 中修改：

```css
:root {
    --primary-color: #2c3e50;    /* 主色調 */
    --accent-color: #3498db;     /* 強調色 */
    --bg-color: #f8f9fa;         /* 背景色 */
    --text-color: #333;          /* 文字顏色 */
}
```

### 添加新專案

在 `projects.html` 中複製並修改專案卡片：

```html
<div class="project-card">
    <h3>🎯 專案名稱</h3>
    <div class="meta">時間 | 類型</div>
    <p>專案描述...</p>
    <div class="tech-tags">
        <span class="tech-tag">技術1</span>
        <span class="tech-tag">技術2</span>
    </div>
    <a href="專案連結" class="btn">查看詳情</a>
</div>
```

## 🌐 部署說明

### GitHub Pages 部署

1. **確保倉庫名稱正確**
   ```
   yourusername.github.io
   ```

2. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Update website"
   git push origin main
   ```

3. **啟用 GitHub Pages**
   - 進入倉庫 Settings
   - 找到 Pages 選項
   - Source 選擇 `main` 分支
   - 保存後等待部署完成

4. **訪問你的網站**
   ```
   https://yourusername.github.io
   ```

### 其他部署選項

- **Netlify**: 拖放文件夾即可部署
- **Vercel**: 連接 GitHub 自動部署
- **Cloudflare Pages**: 高性能全球 CDN

## 🌏 瀏覽器支援

| 瀏覽器 | 版本 |
|--------|------|
| Chrome | 最新版 ✅ |
| Firefox | 最新版 ✅ |
| Safari | 最新版 ✅ |
| Edge | 最新版 ✅ |
| Opera | 最新版 ✅ |

> **注意**: 建議使用現代瀏覽器以獲得最佳體驗。

## 📱 響應式斷點

```css
/* 平板及以下 */
@media (max-width: 900px) { }

/* 手機 */
@media (max-width: 600px) { }
```

## 🔮 未來計劃

- [ ] 添加博客功能
- [ ] 整合後端 API（聯絡表單真實發送）
- [ ] 添加多語言支持
- [ ] 實現深色模式切換
- [ ] 添加專案篩選功能
- [ ] 整合 Google Analytics
- [ ] 添加 RSS 訂閱
- [ ] SEO 優化
- [ ] 性能優化（圖片懶載入等）
- [ ] 添加更多互動動畫

## 🤝 貢獻

歡迎提出問題和建議！

1. Fork 本倉庫
2. 創建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

## 📝 更新日誌

### v2.0.0 (2024)
- ✨ 新增聯絡表單頁面
- ✨ 創建統一的樣式表和腳本文件
- 🎨 優化所有頁面設計
- 📱 改進響應式佈局
- 🔧 添加互動功能和動畫效果
- 📚 完善項目文檔

### v1.0.0 (2024)
- 🎉 初始版本發布
- 📄 創建基本頁面結構
- 🎨 實現基礎樣式設計

## 📄 授權協議

本項目採用 [MIT License](https://opensource.org/licenses/MIT)

## 👨‍💻 作者

**C. Y.**

- GitHub: [@Chenyou0113](https://github.com/Chenyou0113)
- Email: xiaoyouwu5@gmail.com
- Website: [chenyou0113.github.io](https://chenyou0113.github.io)

## 💬 聯絡方式

如有任何問題或建議，歡迎通過以下方式聯繫：

- 📧 Email: xiaoyouwu5@gmail.com
- 💻 GitHub Issues: [提交問題](https://github.com/Chenyou0113/chenyou0113.github.io/issues)
- 🌐 網站表單: [聯絡表單](https://chenyou0113.github.io/contact.html)

---

⭐ 如果這個項目對你有幫助，請給一個星星！

**Built with ❤️ using HTML, CSS & JavaScript**
