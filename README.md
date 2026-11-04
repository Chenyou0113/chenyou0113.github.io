# C. Y. — 個人網站

C. Y.的個人網站：網域、交通開放資料，還有一些日常雜記。

全站是**手寫的 HTML / CSS / JavaScript**——沒有框架、沒有打包、沒有建置流程。把檔案丟上 GitHub Pages 就能直接跑，也可以用瀏覽器打開單一頁面預覽。

---

## 目錄

- [特色](#特色)
- [技術組成](#技術組成)
- [檔案結構](#檔案結構)
- [本機執行](#本機執行)
- [使用說明](#使用說明)
  - [頁面一覽](#頁面一覽)
  - [切換深色模式](#切換深色模式)
  - [文章標籤篩選](#文章標籤篩選)
  - [複製信箱](#複製信箱)
  - [聯絡表單](#聯絡表單)
- [寫一篇新文章](#寫一篇新文章)
- [更新首頁內容](#更新首頁內容)
- [調整設計](#調整設計)
- [部署](#部署)
- [授權與聯絡](#授權與聯絡)

---

## 特色

- **紙張質感的編輯排版**：暖米白底色 `#f7f4ee`，加上一層極淡的 SVG 雜訊遮罩，模擬紙面。
- **字體**：Noto Serif TC（標題與內文）＋ JetBrains Mono（日期、標籤、編號、小標）。
- **單一強調色**：磚紅 `#8c3a1e`，全站只用這一個顏色；以 1px 細線分隔、不用陰影與圓角卡片。
- **深色模式**：暖炭黑配色，預設跟隨系統偏好，可手動切換並以 `localStorage` 記住。
- **極簡動態**：只有淡入 + 上移 8px，透過 `IntersectionObserver` 觸發，並尊重 `prefers-reduced-motion`。
- **零依賴**：不載入任何 JS 套件；唯一的遠端資源是 Google Fonts。

## 技術組成

| 項目 | 內容 |
| --- | --- |
| 標記 / 樣式 / 腳本 | 原生 HTML5、CSS、ES6 JavaScript（無框架） |
| 樣式檔 | `paper.css`（全站唯一的樣式檔，含設計變數與深色模式） |
| 腳本 | `script.js`（主題、選單、進場動態、導覽高亮、標籤篩選、複製、表單、目錄捲動） |
| 外部資源 | Google Fonts：Noto Serif TC、JetBrains Mono |
| 建置 | 無 |
| 託管 | GitHub Pages |

## 檔案結構

```
.
├── index.html              首頁（開場 / 現在 / 精選作品 / 值得一讀 / 軌跡 / 聯絡）
├── about.html              關於（我會什麼 / 做過的事 / 幾個想法 / 找我）
├── projects.html           專案（weacamm.org、BusTally 等）
├── blog.html               文章列表（含自動生成的標籤篩選）
├── friends.html            友站
├── contact.html            聯絡（含示範表單與複製信箱）
├── paper.css               全站設計系統與深色模式
├── script.js               所有前端行為
└── posts/
    ├── _template.html      文章模板，複製這個開始寫
    ├── infra-cloudflare-weacamm.html
    ├── tdx-polling.html
    ├── railway-data-observation.html
    ├── cctv-proxy.html
    ├── lightweight-automation-daily.html
    └── railway-notes.html
```

## 本機執行

不需要安裝任何東西。三種預覽方式，任選一種：

1. **直接開檔**：雙擊 `index.html`，用瀏覽器開啟即可。
2. **本機伺服器（建議）**：從專案根目錄執行

   ```bash
   # Python 3（macOS / Linux 通常內建）
   python3 -m http.server 8000

   # 或 Windows
   python -m http.server 8000
   ```

   然後打開 <http://localhost:8000>。

3. **Node 環境**（若有安裝 Node.js）：

   ```bash
   npx serve .
   ```

> 之所以建議用本機伺服器，是因為部分瀏覽器在 `file://` 協定下會限制 `localStorage`、剪貼簿等 API，行為可能與線上不一致。

## 使用說明

### 頁面一覽

| 頁面 | 路徑 | 內容 |
| --- | --- | --- |
| 首頁 | `index.html` | 開場、現在（正在做／正在讀／最近在想）、精選作品、值得一讀、軌跡、聯絡 |
| 關於 | `about.html` | 自我介紹、技能、做過的事、想法、聯絡方式 |
| 專案 | `projects.html` | 專案紀錄與外部連結 |
| 文章 | `blog.html` | 文章列表，可依標籤篩選 |
| 友站 | `friends.html` | 友站連結、交換連結的聯絡方式 |
| 聯絡 | `contact.html` | 信箱（可一鍵複製）與示範表單 |

所有頁面共用同一組頁首導覽與頁尾；導覽列的當前頁面會自動高亮（由 `script.js` 的 `initActiveNav` 依網址檔名比對）。

### 切換深色模式

點頁首右側的太陽／月亮圖示即可切換。預設跟隨系統的 `prefers-color-scheme`，手動切換後會存入 `localStorage` 的 `cy_theme` 鍵，下次造訪沿用。

### 文章標籤篩選

`blog.html` 的標籤列**不需要手動維護**：`script.js` 會從每篇文章 `<li class="post-item" data-tags="...">` 的 `data-tags` 自動收集、依出現次數排序後生成按鈕。

也支援網址參數預選標籤，例如：

```
blog.html?tag=TDX
```

### 複製信箱

頁面上標有 `data-copy="xiaoyouwu5@gmail.com"` 的按鈕（首頁、友站、聯絡頁）點擊後會複製信箱並顯示提示；若 `navigator.clipboard` 不可用，會退回 `execCommand('copy')`。

### 聯絡表單

`contact.html` 的表單**僅為前端示範**，按下送出不會真的寄出，會顯示提示請你改用頁面右側的信箱聯絡。這是刻意的誠實設計，不假裝寄送、也不顯示假的進度動畫。

## 寫一篇新文章

1. 複製 `posts/_template.html` 為 `posts/<slug>.html`。
2. 修改 `title`、`description`、`<time datetime="...">`、文章標題與內文。
3. 更新檔尾 `prev-next` 的上下篇連結。
4. 在 `blog.html` 的 `<ul id="post-list">` 內新增一筆（`data-tags` 用空白分隔多個標籤）：

   ```html
   <li class="post-item" data-tags="標籤一 標籤二">
     <span class="post-date">2026.11.02</span>
     <div>
       <h2 class="post-title"><a href="posts/你的-slug.html">文章標題</a></h2>
       <p class="post-summary">一句話摘要。</p>
       <div class="post-tags">
         <span class="chip">標籤一</span>
         <span class="chip">標籤二</span>
       </div>
     </div>
     <span class="post-arrow">→</span>
   </li>
   ```

   > 標籤篩選會自動從 `data-tags` 生成，不用另外維護標籤清單。

5. 需要時，在 `index.html` 的 `<ul id="home-posts">` 補上首頁「值得一讀」的精選文章（一般放最新 3 篇）。

## 更新首頁內容

- **「現在」區塊**：首頁最常更新的地方。直接改 `index.html` 裡 `.now-list` 的三個 `.now-item`（正在做／正在讀／最近在想），順手把「Updated 2026.11」改成當月。
- **「值得一讀」**：更新 `<ul id="home-posts">`，與最新文章同步。
- **「軌跡」與頁尾年份**：`2026` 為目前版權年份，跨年時一併更新。

## 調整設計

設計都集中在 `paper.css` 開頭的兩組變數，改這裡就能全站生效：

```css
:root {
  --paper: #f7f4ee;      /* 底色 */
  --ink: #23201c;        /* 主要文字 */
  --accent: #8c3a1e;     /* 唯一強調色（磚紅） */
  --serif: "Noto Serif TC", Georgia, serif;
  --mono: "JetBrains Mono", ui-monospace, monospace;
  --measure: 64ch;       /* 內文行寬 */
}

[data-theme="dark"] {
  --paper: #16140f;      /* 深色模式底色 */
  --ink: #e9e2d6;
  --accent: #d97b58;
}
```

若要換字體，記得同步更新各頁 `<head>` 內的 Google Fonts `<link>`。

## 設計原則

- 不放 emoji 當圖示。
- 不放沒有連結的假資料。
- 文案寫具體的事，不寫形容詞。
- 每個區塊都要有存在的理由。

## 部署

推上 `main` 分支，GitHub Pages 會自動發布（使用者／組織頁面 `Chenyou0113.github.io`）。

```bash
git add .
git commit -m "更新內容"
git push origin main
```

## 授權與聯絡

- 內容與程式碼為 C. Y. 所有，轉載請先聯絡。
- 電子郵件：xiaoyouwu5@gmail.com
- GitHub：<https://github.com/Chenyou0113>
- 網站：<https://www.weacamm.org/>
