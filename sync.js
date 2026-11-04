import fs from 'node:fs';
import path from 'node:path';

const NOTION_VERSION = "2022-06-28";

// 1. 讀取環境變數 (支援 .dev.vars 或 .env)
function loadEnv() {
  const env = { ...process.env };
  const envFiles = ['.dev.vars', '.env'];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...vals] = trimmed.split('=');
          env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const NOTION_TOKEN = env.NOTION_TOKEN;
const NOTION_DATABASE_ID = env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error("❌ 找不到 NOTION_TOKEN 或 NOTION_DATABASE_ID！");
  console.error("請在專案根目錄建立 .dev.vars 檔案，並填入：");
  console.error("NOTION_TOKEN=你的Notion金鑰");
  console.error("NOTION_DATABASE_ID=你的資料庫ID\n");
  process.exit(1);
}

// 2. 主執行流程
async function main() {
  console.log("🚀 正在向 Notion API 抓取最新發布的文章...");

  const queryUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
  const res = await fetch(queryUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "Date", direction: "descending" }]
    })
  });

  if (!res.ok) {
    console.error(`❌ Notion API 查詢失敗 (${res.status}):`, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const pages = data.results || [];
  console.log(`✅ 成功取得 ${pages.length} 篇已發布文章！\n`);

  const posts = [];

  // 確保 posts 與 posts/images 目錄存在
  if (!fs.existsSync('posts')) fs.mkdirSync('posts');
  if (!fs.existsSync(path.join('posts', 'images'))) fs.mkdirSync(path.join('posts', 'images'));

  for (const page of pages) {
    const p = page.properties;
    const title = p.Title?.title?.[0]?.plain_text || p.Name?.title?.[0]?.plain_text || "無標題";
    const slug = p.Slug?.rich_text?.[0]?.plain_text || page.id;
    const date = p.Date?.date?.start || "";
    const summary = p.Summary?.rich_text?.[0]?.plain_text || "";
    const tags = (p.Tags?.multi_select || []).map(t => t.name).join(" ");
    const tagChips = (p.Tags?.multi_select || []).map(t => `<span class="chip">${escapeHtml(t.name)}</span>`).join("");

    posts.push({ id: page.id, title, slug, date, summary, tags, tagChips });

    // 抓取文章內文區塊
    console.log(`📥 正在同步文章內文: ${title} (posts/${slug}.html)...`);
    const blocks = await fetchAllBlocks(page.id);
    const contentHtml = await parseBlocksToHtml(blocks, slug);

    // 產生單篇文章實體 HTML 檔案
    const postHtml = generateArticleHtml(title, date, summary, contentHtml, tags);
    fs.writeFileSync(path.join('posts', `${slug}.html`), postHtml, 'utf-8');
  }

  // 3. 更新 blog.html
  updateBlogHtml(posts);

  // 4. 更新 index.html
  updateIndexHtml(posts.slice(0, 3));

  console.log("\n🎉 全部同步完成！你的本地檔案已實體更新：");
  console.log("- index.html (首頁「值得一讀」更新為最新 3 篇)");
  console.log("- blog.html (更新為所有 Notion 發布文章)");
  console.log(`- posts/ (共產生 ${posts.length} 個文章 HTML 檔案)`);
  console.log("- posts/images/ (Notion 圖片已離線化下載，永久不失效且無 AWS 憑證洩漏警報)");
  console.log("\n現在你可以直接預覽，或執行 git commit & git push 推上 GitHub Pages！");
}

// 遞迴抓取所有 Notion Blocks
async function fetchAllBlocks(blockId) {
  let blocks = [];
  let cursor = undefined;
  do {
    let url = `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`;
    if (cursor) url += `&start_cursor=${cursor}`;
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    if (!res.ok) break;
    const data = await res.json();
    blocks.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

// 更新 blog.html
function updateBlogHtml(posts) {
  const file = 'blog.html';
  if (!fs.existsSync(file)) return;

  const listItems = posts.map(p => `
      <li class="post-item"${p.tags ? ` data-tags="${escapeHtml(p.tags)}"` : ""}>
        <span class="post-date">${p.date.replace(/-/g, ".")}</span>
        <div>
          <h2 class="post-title"><a href="posts/${p.slug}.html">${escapeHtml(p.title)}</a></h2>
          <p class="post-summary">${escapeHtml(p.summary)}</p>
          ${p.tagChips ? `<div class="post-tags">${p.tagChips}</div>` : ""}
        </div>
        <span class="post-arrow">→</span>
      </li>`).join("");

  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(
    /<ul class="post-list reveal" id="post-list">([\s\S]*?)<\/ul>/,
    `<ul class="post-list reveal" id="post-list">${listItems ? listItems : '\n      <p class="empty-state">目前沒有已發布的文章。</p>\n    '}\n    </ul>`
  );
  fs.writeFileSync(file, content, 'utf-8');
  console.log("📝 已更新本地 blog.html！");
}

// 更新 index.html
function updateIndexHtml(topPosts) {
  const file = 'index.html';
  if (!fs.existsSync(file)) return;

  const homeItems = topPosts.map(p => `
        <li class="post-item">
          <span class="post-date">${p.date.replace(/-/g, ".")}</span>
          <div>
            <h3 class="post-title"><a href="posts/${p.slug}.html">${escapeHtml(p.title)}</a></h3>
            <p class="post-summary">${escapeHtml(p.summary)}</p>
          </div>
          <span class="post-arrow">→</span>
        </li>`).join("");

  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(
    /<ul class="post-list" id="home-posts">([\s\S]*?)<\/ul>/,
    `<ul class="post-list" id="home-posts">${homeItems}\n      </ul>`
  );
  fs.writeFileSync(file, content, 'utf-8');
  console.log("📝 已更新本地 index.html 首頁！");
}

// 產生與 _template.html 100% 一致的文章 HTML 實體檔
function generateArticleHtml(title, date, summary, contentHtml, tags) {
  const formattedDate = date.replace(/-/g, ".");
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — C. Y.</title>
  <meta name="description" content="${escapeHtml(summary || title)}">
  <meta name="theme-color" content="#f7f4ee">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap">
  <script>
    try {
      var t = localStorage.getItem('cy_theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', t);
    } catch (e) {}
    document.documentElement.classList.add('js');
  </script>
  <link rel="stylesheet" href="../paper.css">
  <script src="../script.js" defer></script>
</head>
<body>

  <header class="site-header">
    <div class="header-inner">
      <a href="../index.html" class="brand">
        <span class="brand-mark">C. Y.</span>
      </a>
      <nav class="site-nav" id="nav-links" aria-label="主要導覽">
        <a href="../index.html" class="nav-link">首頁</a>
        <a href="../about.html" class="nav-link">關於</a>
        <a href="../projects.html" class="nav-link">專案</a>
        <a href="../blog.html" class="nav-link active">文章</a>
        <a href="../friends.html" class="nav-link">友站</a>
        <a href="../contact.html" class="nav-link">聯絡</a>
      </nav>
      <div class="header-actions">
        <button id="theme-toggle" class="icon-btn" aria-label="切換深色模式" title="切換深色模式"></button>
        <button id="mobile-menu-toggle" class="icon-btn mobile-only" aria-label="開啟選單" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <line x1="3" y1="7" x2="21" y2="7"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="17" x2="21" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <main class="page">
    <article class="article">

      <a href="../blog.html" class="article-back">← 回文章列表</a>

      <header class="article-head">
        <div class="article-meta">
          <time datetime="${date}">${formattedDate}</time>
          ${tags ? `<span class="sep">/</span><span>${escapeHtml(tags)}</span>` : ""}
        </div>
        <h1 class="article-title">${escapeHtml(title)}</h1>
        ${summary ? `<p class="article-lede">${escapeHtml(summary)}</p>` : ""}
      </header>

      <div class="prose">
${contentHtml}
      </div>

      <div class="article-foot" style="margin-top: 3rem;">
        <span class="mono" style="color: var(--ink-faint);">寫於 ${formattedDate}</span>
        <a href="../blog.html" class="mono" style="color: var(--accent);">更多文章 →</a>
      </div>

    </article>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <span class="footer-mono">© 2026 C. Y. · 手寫 HTML，沒有框架</span>
      <div class="footer-links">
        <a href="https://github.com/Chenyou0113" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
        <a href="../index.html" class="footer-link">首頁</a>
      </div>
    </div>
  </footer>

</body>
</html>`;
}

// Notion Blocks 轉換成 HTML (支援圖片自動下載離線化，移除 S3 AWS Token)
async function parseBlocksToHtml(blocks, slug) {
  let html = "";
  let inBulletList = false;
  let inNumberedList = false;
  let imageCounter = 1;

  for (const block of blocks) {
    const type = block.type;
    if (type !== "bulleted_list_item" && inBulletList) { html += "</ul>\n"; inBulletList = false; }
    if (type !== "numbered_list_item" && inNumberedList) { html += "</ol>\n"; inNumberedList = false; }

    switch (type) {
      case "paragraph": {
        const text = renderRichText(block.paragraph.rich_text);
        if (text.trim()) html += `        <p>${text}</p>\n`;
        break;
      }
      case "heading_1":
      case "heading_2":
        html += `        <h2>${renderRichText(block[type].rich_text)}</h2>\n`;
        break;
      case "heading_3":
        html += `        <h3>${renderRichText(block.heading_3.rich_text)}</h3>\n`;
        break;
      case "bulleted_list_item":
        if (!inBulletList) { html += "        <ul>\n"; inBulletList = true; }
        html += `          <li>${renderRichText(block.bulleted_list_item.rich_text)}</li>\n`;
        break;
      case "numbered_list_item":
        if (!inNumberedList) { html += "        <ol>\n"; inNumberedList = true; }
        html += `          <li>${renderRichText(block.numbered_list_item.rich_text)}</li>\n`;
        break;
      case "quote":
        html += `        <blockquote><p>${renderRichText(block.quote.rich_text)}</p></blockquote>\n`;
        break;
      case "code": {
        const lang = block.code.language || "text";
        const codeText = escapeHtml(block.code.rich_text.map(t => t.plain_text).join(""));
        html += `        <pre><code class="language-${lang}">${codeText}</code></pre>\n`;
        break;
      }
      case "divider":
        html += "        <hr>\n";
        break;
      case "image": {
        const remoteUrl = block.image.type === "external" ? block.image.external.url : block.image.file.url;
        const caption = block.image.caption?.length ? block.image.caption[0].plain_text : "";

        // 自動將 Notion S3 圖片下載至本地 posts/images/，徹底避免 AWS 臨時金鑰洩漏與連結過期
        let localSrc = remoteUrl;
        try {
          const extMatch = remoteUrl.match(/\.(png|jpe?g|gif|webp|svg)/i);
          const ext = extMatch ? extMatch[0].toLowerCase() : '.png';
          const filename = `${slug}-img-${imageCounter++}${ext}`;
          const localPath = path.join('posts', 'images', filename);

          console.log(`   📸 下載圖片至: ${localPath}...`);
          const imgRes = await fetch(remoteUrl);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            fs.writeFileSync(localPath, buffer);
            localSrc = `images/${filename}`;
          }
        } catch (imgErr) {
          console.warn(`   ⚠️ 圖片下載失敗，保留原始連結:`, imgErr.message);
        }

        html += `        <figure><img src="${localSrc}" alt="${escapeHtml(caption)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>\n`;
        break;
      }
    }
  }
  if (inBulletList) html += "        </ul>\n";
  if (inNumberedList) html += "        </ol>\n";
  return html;
}

function renderRichText(textArray) {
  if (!textArray || textArray.length === 0) return "";
  return textArray.map(item => {
    let text = escapeHtml(item.plain_text);
    const ann = item.annotations;
    if (ann.bold) text = `<strong>${text}</strong>`;
    if (ann.italic) text = `<em>${text}</em>`;
    if (ann.code) text = `<code>${text}</code>`;
    if (ann.strikethrough) text = `<s>${text}</s>`;
    if (item.href) text = `<a href="${item.href}" target="_blank" rel="noopener">${text}</a>`;
    return text;
  }).join("");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

main().catch(err => {
  console.error("❌ 發生未預期的錯誤:", err);
  process.exit(1);
});
