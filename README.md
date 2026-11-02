# chenyou0113.github.io

個人網站。手寫 HTML / CSS / JavaScript，沒有框架、沒有建置流程，直接丟 GitHub Pages 就能跑。

## 設計

紙張質感的編輯排版：

- **底色** 暖米白 `#f7f4ee`，不是純白
- **字體** Noto Serif TC（標題與內文）＋ JetBrains Mono（日期、標籤、編號）
- **強調色** 磚紅 `#8c3a1e`，全站只用這一個顏色
- **分隔** 1px 細線，不用陰影、不用圓角卡片
- **動態** 只有淡入 + 上移 8px，尊重 `prefers-reduced-motion`
- **深色模式** 暖炭黑，跟隨系統偏好，可手動切換

## 檔案結構

```
.
├── index.html              首頁（開場 / 現在 / 精選作品 / 值得一讀 / 軌跡 / 聯絡）
├── about.html              關於
├── projects.html           專案
├── blog.html               文章列表（含標籤篩選）
├── friends.html            友站
├── contact.html            聯絡
├── bus-liveboard.html      公車動態地圖（獨立工具，樣式內嵌）
├── paper.css               全站設計系統（唯一的樣式檔）
├── script.js               主題切換、行動選單、篩選、複製、表單
├── posts.json              文章資料（給首頁與搜尋用）
└── posts/
    ├── _template.html      文章模板，複製這個開始寫
    ├── infra-cloudflare.html
    ├── railway-data.html
    ├── automation.html
```

## 怎麼寫一篇新文章

1. 複製 `posts/_template.html` 為 `posts/<slug>.html`
2. 改 `title`、`description`、`<time datetime>`、標題、內文
3. 更新檔尾 `prev-next` 的上下篇連結
4. 在 `blog.html` 的 `<ul id="post-list">` 加一筆：

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

標籤篩選會自動從 `data-tags` 生成，不用另外維護。

5. 在 `posts.json` 加一筆（首頁的「值得一讀」與未來搜尋用）

## 更新「現在」

首頁的「現在」區塊（正在做 / 正在讀 / 最近在想）是最常需要更新的地方。
直接改 `index.html` 裡 `.now-list` 的三個 `.now-item`，順手把 `Updated 2026.11` 改成當月。

## 設計原則

- 不放 emoji 當圖示
- 不放沒有連結的假資料
- 文案寫具體的事，不寫形容詞
- 每個區塊都要有存在的理由

## 本機預覽

直接開 `index.html` 即可。若要用本機伺服器：

```bash
python -m http.server 8000
```

## 部署

推上 `main` 分支，GitHub Pages 自動發布。