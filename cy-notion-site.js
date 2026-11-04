const NOTION_VERSION = "2022-06-28";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. 首頁路由 (/ 或 /index.html)：動態注入「值得一讀」最新 3 篇文章
    if (path === "/" || path === "/index.html") {
      return await handleCached(request, env, ctx, () => handleHome(request, env));
    }

    // 2. 文章列表路由 (/blog 或 /blog.html)：動態注入完整 Notion 文章列表
    if (path === "/blog" || path === "/blog.html") {
      return await handleCached(request, env, ctx, () => handleBlog(request, env));
    }

    // 3. 文章內頁路由 (/posts/...)：動態渲染 Notion 文章內容
    if (path.startsWith("/posts/")) {
      const slug = path.replace("/posts/", "").replace(/\.html$/, "").replace(/\/$/, "");
      
      const postResponse = await handleCached(request, env, ctx, () => handlePost(slug, env));
      
      // 若 Notion 找到文章，直接回傳
      if (postResponse && postResponse.status === 200) {
        return postResponse;
      }

      // 若 Notion 無此文章，平滑 fallback 至本機 posts/ 內的靜態檔案
      return env.ASSETS.fetch(request);
    }

    // 4. 其他所有靜態資源 (CSS, JS, about.html, projects.html 等)，由 Cloudflare 邊緣秒開
    return env.ASSETS.fetch(request);
  }
};

/**
 * 邊緣快取封裝 (預設快取 60 秒；支援 ?refresh=1 強制秒級同步)
 */
async function handleCached(request, env, ctx, handler) {
  const url = new URL(request.url);
  const isForceRefresh = url.searchParams.has("refresh") || url.searchParams.has("purge");

  // 快取鍵規範化 (去除 refresh/purge 參數，強制刷新後能同步覆蓋一般訪客的快取)
  const cacheKeyUrl = new URL(request.url);
  cacheKeyUrl.searchParams.delete("refresh");
  cacheKeyUrl.searchParams.delete("purge");
  const cacheKey = new Request(cacheKeyUrl.toString(), request);

  const cache = caches.default;
  let response = !isForceRefresh ? await cache.match(cacheKey) : null;
  if (response) return response;

  try {
    response = await handler();

    // 只有在成功處理且沒有嚴重 Notion 報錯時才寫入快取
    if (response && response.status === 200) {
      const isDebugError = response.headers.get("X-Debug-Status")?.includes("Error");
      if (!isDebugError) {
        response = new Response(response.body, response);
        response.headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
    }

    return response;
  } catch (err) {
    return new Response(`Server Error: ${err.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

/**
 * 1. 首頁動態注入 (讀取原生 index.html，將 #home-posts 替換為 Notion 最新 3 篇)
 */
async function handleHome(request, env) {
  const indexUrl = new URL("/index.html", request.url);
  const assetRes = await env.ASSETS.fetch(new Request(indexUrl, request));
  if (!assetRes.ok) return assetRes;
  let html = await assetRes.text();

  let debugMsg = "OK: Worker executed";

  if (!env.NOTION_TOKEN || !env.NOTION_DATABASE_ID) {
    debugMsg = "Missing Env: NOTION_TOKEN or NOTION_DATABASE_ID is not configured in Cloudflare!";
    return makeDebugResponse(html, debugMsg);
  }

  try {
    const queryUrl = `https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`;
    const res = await fetch(queryUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 3
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      debugMsg = `Notion API Error (${res.status}): ${errText}`;
    } else {
      const data = await res.json();
      const posts = (data.results || []).map(page => {
        const p = page.properties;
        return {
          title: p.Title?.title?.[0]?.plain_text || p.Name?.title?.[0]?.plain_text || "無標題",
          slug: p.Slug?.rich_text?.[0]?.plain_text || page.id,
          date: p.Date?.date?.start || "",
          summary: p.Summary?.rich_text?.[0]?.plain_text || ""
        };
      });

      if (posts.length > 0) {
        const homePostsHtml = posts.map(p => `
        <li class="post-item">
          <span class="post-date">${p.date.replace(/-/g, ".")}</span>
          <div>
            <h3 class="post-title"><a href="/posts/${p.slug}">${escapeHtml(p.title)}</a></h3>
            <p class="post-summary">${escapeHtml(p.summary)}</p>
          </div>
          <span class="post-arrow">→</span>
        </li>`).join("");

        html = html.replace(
          /<ul class="post-list" id="home-posts">([\s\S]*?)<\/ul>/,
          `<ul class="post-list" id="home-posts">${homePostsHtml}\n      </ul>`
        );
        debugMsg = `OK: Injected ${posts.length} posts from Notion`;
      } else {
        debugMsg = "OK: Connected to Notion, but found 0 published posts (Check if 'Published' checkbox is ticked)";
      }
    }
  } catch (err) {
    debugMsg = `Fetch Exception: ${err.message}`;
  }

  return makeDebugResponse(html, debugMsg);
}

/**
 * 2. 文章列表動態注入 (讀取原生 blog.html，將 #post-list 替換為 Notion 文章)
 */
async function handleBlog(request, env) {
  const blogUrl = new URL("/blog.html", request.url);
  const assetRes = await env.ASSETS.fetch(new Request(blogUrl, request));
  let html = assetRes.ok ? await assetRes.text() : null;

  let debugMsg = "OK: Worker executed";

  if (!env.NOTION_TOKEN || !env.NOTION_DATABASE_ID) {
    debugMsg = "Missing Env: NOTION_TOKEN or NOTION_DATABASE_ID is not configured in Cloudflare!";
    if (html) return makeDebugResponse(html, debugMsg);
    return new Response(debugMsg, { status: 500 });
  }

  try {
    const queryUrl = `https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`;
    const res = await fetch(queryUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "Date", direction: "descending" }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      debugMsg = `Notion API Error (${res.status}): ${errText}`;
    } else {
      const data = await res.json();
      const posts = (data.results || []).map(page => {
        const p = page.properties;
        const tags = (p.Tags?.multi_select || []).map(t => t.name).join(" ");
        return {
          title: p.Title?.title?.[0]?.plain_text || p.Name?.title?.[0]?.plain_text || "無標題",
          slug: p.Slug?.rich_text?.[0]?.plain_text || page.id,
          date: p.Date?.date?.start || "",
          summary: p.Summary?.rich_text?.[0]?.plain_text || "",
          tags: tags,
          tagChips: (p.Tags?.multi_select || []).map(t => `<span class="chip">${escapeHtml(t.name)}</span>`).join("")
        };
      });

      const listItems = posts.map(p => `
      <li class="post-item"${p.tags ? ` data-tags="${escapeHtml(p.tags)}"` : ""}>
        <span class="post-date">${p.date.replace(/-/g, ".")}</span>
        <div>
          <h2 class="post-title"><a href="/posts/${p.slug}">${escapeHtml(p.title)}</a></h2>
          <p class="post-summary">${escapeHtml(p.summary)}</p>
          ${p.tagChips ? `<div class="post-tags">${p.tagChips}</div>` : ""}
        </div>
        <span class="post-arrow">→</span>
      </li>`).join("");

      if (html) {
        html = html.replace(
          /<ul class="post-list reveal" id="post-list">([\s\S]*?)<\/ul>/,
          `<ul class="post-list reveal" id="post-list">${listItems ? listItems : '<p class="empty-state">目前沒有已發布的文章。</p>'}\n    </ul>`
        );
        debugMsg = `OK: Injected ${posts.length} posts from Notion into Blog`;
      }
    }
  } catch (err) {
    debugMsg = `Fetch Exception: ${err.message}`;
  }

  if (html) return makeDebugResponse(html, debugMsg);
  return new Response(debugMsg, { status: 500 });
}

/**
 * 輔助函式：附帶 Debug 訊息的 HTML 回應
 */
function makeDebugResponse(html, debugMsg) {
  const annotatedHtml = html + `\n<!-- DEBUG_INFO: ${debugMsg} -->`;
  return new Response(annotatedHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Debug-Status": debugMsg
    }
  });
}

/**
 * 3. 單篇動態文章抓取與排版
 */
async function handlePost(slug, env) {
  if (!env.NOTION_TOKEN || !env.NOTION_DATABASE_ID) {
    return new Response("Notion 環境變數未設定", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const queryUrl = `https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`;
  const pageRes = await fetch(queryUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Slug", rich_text: { equals: slug } },
          { property: "Published", checkbox: { equals: true } }
        ]
      }
    })
  });

  let page = null;
  if (pageRes.ok) {
    const pageData = await pageRes.json();
    page = pageData.results?.[0];
  }

  // 防呆機制：若 Slug 找不到且長度 >= 32，嘗試直接以 Notion Page ID 抓取
  if (!page && slug.replace(/-/g, "").length >= 32) {
    const rawId = slug.replace(/-/g, "");
    const formattedId = `${rawId.slice(0,8)}-${rawId.slice(8,12)}-${rawId.slice(12,16)}-${rawId.slice(16,20)}-${rawId.slice(20)}`;
    const directRes = await fetch(`https://api.notion.com/v1/pages/${formattedId}`, {
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    if (directRes.ok) {
      page = await directRes.json();
    }
  }

  if (!page) {
    return new Response("文章不存在或未發布", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const props = page.properties || {};
  const title = props.Title?.title?.[0]?.plain_text || props.Name?.title?.[0]?.plain_text || "無標題";
  const date = props.Date?.date?.start || "";
  const summary = props.Summary?.rich_text?.[0]?.plain_text || "";

  let blocks = [];
  let cursor = undefined;
  do {
    let blocksUrl = `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`;
    if (cursor) blocksUrl += `&start_cursor=${cursor}`;
    
    const blocksRes = await fetch(blocksUrl, {
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    if (!blocksRes.ok) break;
    const blocksData = await blocksRes.json();
    blocks.push(...(blocksData.results || []));
    cursor = blocksData.has_more ? blocksData.next_cursor : undefined;
  } while (cursor);

  const contentHtml = parseBlocksToHtml(blocks);

  const articleHtml = `
    <article class="article">
      <a href="/blog" class="article-back">← 回文章列表</a>
      <header class="article-head">
        <div class="article-meta">
          <time datetime="${date}">${date.replace(/-/g, ".")}</time>
        </div>
        <h1 class="article-title">${escapeHtml(title)}</h1>
        ${summary ? `<p class="article-lede">${escapeHtml(summary)}</p>` : ""}
      </header>
      <div class="prose">
        ${contentHtml}
      </div>
      <div class="article-foot" style="margin-top: 3rem;">
        <span class="mono" style="color: var(--ink-faint);">寫於 ${date.replace(/-/g, ".")}</span>
        <a href="/blog" class="mono" style="color: var(--accent);">更多文章 →</a>
      </div>
    </article>
  `;

  return new Response(renderLayout(`${title} — C. Y.`, articleHtml, "post"), {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

/**
 * 4. Notion Block 轉 HTML
 */
function parseBlocksToHtml(blocks) {
  let html = "";
  let inBulletList = false;
  let inNumberedList = false;

  for (const block of blocks) {
    const type = block.type;
    if (type !== "bulleted_list_item" && inBulletList) { html += "</ul>\n"; inBulletList = false; }
    if (type !== "numbered_list_item" && inNumberedList) { html += "</ol>\n"; inNumberedList = false; }

    switch (type) {
      case "paragraph": {
        const text = renderRichText(block.paragraph.rich_text);
        if (text.trim()) html += `<p>${text}</p>\n`;
        break;
      }
      case "heading_1":
        html += `<h2>${renderRichText(block.heading_1.rich_text)}</h2>\n`;
        break;
      case "heading_2":
        html += `<h2>${renderRichText(block.heading_2.rich_text)}</h2>\n`;
        break;
      case "heading_3":
        html += `<h3>${renderRichText(block.heading_3.rich_text)}</h3>\n`;
        break;
      case "bulleted_list_item":
        if (!inBulletList) { html += "<ul>\n"; inBulletList = true; }
        html += `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>\n`;
        break;
      case "numbered_list_item":
        if (!inNumberedList) { html += "<ol>\n"; inNumberedList = true; }
        html += `<li>${renderRichText(block.numbered_list_item.rich_text)}</li>\n`;
        break;
      case "quote":
        html += `<blockquote><p>${renderRichText(block.quote.rich_text)}</p></blockquote>\n`;
        break;
      case "code": {
        const lang = block.code.language || "text";
        const codeText = escapeHtml(block.code.rich_text.map(t => t.plain_text).join(""));
        html += `<pre><code class="language-${lang}">${codeText}</code></pre>\n`;
        break;
      }
      case "divider":
        html += "<hr>\n";
        break;
      case "image": {
        const src = block.image.type === "external" ? block.image.external.url : block.image.file.url;
        const caption = block.image.caption?.length ? block.image.caption[0].plain_text : "";
        html += `<figure><img src="${src}" alt="${escapeHtml(caption)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>\n`;
        break;
      }
    }
  }
  if (inBulletList) html += "</ul>\n";
  if (inNumberedList) html += "</ol>\n";
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

/**
 * 5. 文章外框模板
 */
function renderLayout(title, content, activeNav = "") {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
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
  <link rel="stylesheet" href="/paper.css">
  <script src="/script.js" defer></script>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="brand">
        <span class="brand-mark">C. Y.</span>
        <span class="brand-name">吳承祐</span>
      </a>

      <nav class="site-nav" id="nav-links" aria-label="主要導覽">
        <a href="/" class="nav-link">首頁</a>
        <a href="/about.html" class="nav-link">關於</a>
        <a href="/projects.html" class="nav-link">專案</a>
        <a href="/blog" class="nav-link ${activeNav === 'blog' || activeNav === 'post' ? 'active' : ''}">文章</a>
        <a href="/friends.html" class="nav-link">友站</a>
        <a href="/contact.html" class="nav-link">聯絡</a>
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
    ${content}
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <span class="footer-mono">© 2026 吳承祐 · 手寫 HTML，沒有框架</span>
      <div class="footer-links">
        <a href="https://github.com/Chenyou0113" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
        <a href="/" class="footer-link">首頁</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
