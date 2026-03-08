// Articles page - load from data.json
const DATA_URL = 'data/data.json';
const articlesList = document.getElementById('articles-list');
const articleView = document.getElementById('article-view');
const articlesLayout = document.getElementById('articles-layout');
const thinkingState = document.getElementById('articles-thinking');
const articlesContent = document.getElementById('articles-content');
const thinkingBar = document.getElementById('thinking-bar');

// Check URL hash for article slug
function getSlugFromHash() {
  return (location.hash || '').replace('#', '');
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadArticles() {
  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    const articles = data.articles || [];

    if (thinkingState) thinkingState.classList.add('hidden');
    if (articlesContent) articlesContent.classList.add('visible');

    articlesList.innerHTML = articles.map(a => `
      <article class="article-card" data-slug="${a.slug}">
        <h4 class="article-title">${a.title}</h4>
        <p class="article-excerpt">${a.excerpt}</p>
        <div class="article-meta">
          <span class="article-date">${formatDate(a.date)}</span>
          <div class="article-tags">
            ${(a.tags || []).map(t => `<span class="article-tag">${t}</span>`).join('')}
          </div>
        </div>
      </article>
    `).join('');

    articlesList.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.dataset.slug;
        location.hash = slug;
        showArticle(slug, articles);
      });
    });

    const slug = getSlugFromHash();
    if (slug) showArticle(slug, articles);

    setTimeout(() => {
      if (thinkingBar) thinkingBar.classList.add('hidden');
      document.body.classList.add('thinking-done');
    }, 800);
    document.getElementById('year').textContent = new Date().getFullYear();
  } catch (e) {
    console.error(e);
    if (thinkingState) thinkingState.classList.add('hidden');
    if (articlesContent) articlesContent.classList.add('visible');
    articlesList.innerHTML = '<p class="article-empty">Failed to load articles.</p>';
  }
}

function showArticle(slug, articles) {
  const article = articles.find(a => a.slug === slug);
  if (!article) {
    articleView.innerHTML = '';
    articleView.classList.remove('visible');
    if (articlesLayout) articlesLayout.classList.remove('article-active');
    document.body.classList.remove('article-viewing');
    updateActiveCard(null);
    return;
  }
  articleView.innerHTML = `
    <div class="article-full">
      <a href="#" class="article-back">← Back to list</a>
      <div class="article-header-row">
        <h2 class="article-full-title">${article.title}</h2>
        <button type="button" class="article-share-btn" title="Share to Instagram Stories" aria-label="Share to Instagram Stories">
          <span class="share-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
          </span> Share to Stories
        </button>
      </div>
      <div class="article-full-meta">${formatDate(article.date)} · ${(article.tags || []).join(', ')}</div>
      <div class="article-full-content">${article.content}</div>
    </div>
  `;
  articleView.classList.add('visible');
  if (articlesLayout) articlesLayout.classList.add('article-active');
  document.body.classList.add('article-viewing');
  updateActiveCard(slug);
  articleView.querySelector('.article-back')?.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '';
    articleView.innerHTML = '';
    articleView.classList.remove('visible');
    if (articlesLayout) articlesLayout.classList.remove('article-active');
    document.body.classList.remove('article-viewing');
    updateActiveCard(null);
  });

  articleView.querySelector('.article-share-btn')?.addEventListener('click', () => {
    openShareModal(article);
  });
}

// Website theme colors for share card (matches styles.css)
const SHARE_COLORS = {
  bg: '#1A2517',
  surface: '#232d20',
  accent: '#ACC8A2',
  text: '#e8efe6',
  muted: '#8a9a85',
  border: 'rgba(172, 200, 162, 0.3)',
};

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const SITE_URL = 'https://achgz.dev';

function getParagraphs(html) {
  if (!html) return [];
  const div = document.createElement('div');
  div.innerHTML = html;
  const blocks = [];
  div.querySelectorAll('p, h1, h2, h3').forEach((el) => {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t) blocks.push(t);
  });
  return blocks;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawShareCard(article) {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const padH = 64;
  const padV = 80;
  const contentWidth = STORY_WIDTH - padH * 2;
  const cardPadding = 80;
  const innerContentWidth = contentWidth - cardPadding * 2;

  const titleFont = '600 48px Roboto, system-ui, sans-serif';
  const bodyFont = '400 30px Roboto, system-ui, sans-serif';
  const urlFont = '400 28px Roboto, system-ui, sans-serif';

  ctx.font = titleFont;
  const titleLines = wrapText(ctx, article.title, innerContentWidth);
  const paragraphs = getParagraphs(article.content);
  ctx.font = bodyFont;
  const bodyLineHeight = 46;
  const paragraphGap = 32;
  const gap = 48;
  const urlHeight = 72;
  const readMoreHeight = 56;
  const cardTop = padV;
  const cardHeight = STORY_HEIGHT - padV * 2 - urlHeight;
  const cardBottom = cardTop + cardHeight - cardPadding - readMoreHeight;

  // Full background – website theme (fills entire story, no black bars)
  ctx.fillStyle = SHARE_COLORS.bg;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // Subtle gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT);
  grad.addColorStop(0, 'rgba(172, 200, 162, 0.06)');
  grad.addColorStop(0.5, 'transparent');
  grad.addColorStop(1, 'rgba(172, 200, 162, 0.08)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // Content card – fills most of the story (top to bottom)
  ctx.fillStyle = SHARE_COLORS.surface;
  ctx.strokeStyle = SHARE_COLORS.border;
  ctx.lineWidth = 2;
  roundRect(ctx, padH, cardTop, contentWidth, cardHeight, 28);
  ctx.fill();
  ctx.stroke();

  // Clip to card so content doesn't overflow
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, padH, cardTop, contentWidth, cardHeight, 28);
  ctx.clip();

  const titleLineHeight = 60;

  // Title
  ctx.fillStyle = SHARE_COLORS.accent;
  ctx.font = titleFont;
  ctx.textAlign = 'left';
  let y = cardTop + cardPadding + 40;
  titleLines.forEach((line) => {
    ctx.fillText(line, padH + cardPadding, y);
    y += titleLineHeight;
  });

  // Body – paragraph by paragraph with spacing
  ctx.fillStyle = SHARE_COLORS.text;
  ctx.font = bodyFont;
  y += gap;
  let contentCut = false;
  for (let i = 0; i < paragraphs.length && !contentCut; i++) {
    if (i > 0) y += paragraphGap;
    const lines = wrapText(ctx, paragraphs[i], innerContentWidth);
    for (const line of lines) {
      if (y + bodyLineHeight > cardBottom) {
        contentCut = true;
        break;
      }
      ctx.fillText(line, padH + cardPadding, y);
      y += bodyLineHeight;
    }
  }

  // "Read more" when content was cut off
  if (contentCut) {
    ctx.fillStyle = SHARE_COLORS.accent;
    ctx.font = '500 26px Roboto, system-ui, sans-serif';
    ctx.fillText('Read more at achgz.dev →', padH + cardPadding, cardBottom + 34);
  }

  ctx.restore();

  // Website link – below card
  ctx.fillStyle = SHARE_COLORS.accent;
  ctx.font = urlFont;
  ctx.textAlign = 'center';
  ctx.fillText(SITE_URL, STORY_WIDTH / 2, STORY_HEIGHT - padV - 20);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function dataUrlToFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

async function shareToStories(imageFile, article) {
  if (!navigator.share || !navigator.canShare?.({ files: [imageFile] })) {
    return false;
  }
  try {
    await navigator.share({
      files: [imageFile],
      title: article.title,
      text: `Read more: ${SITE_URL}/articles.html#${article.slug}`,
    });
    return true;
  } catch (e) {
    if (e.name === 'AbortError') return true;
    return false;
  }
}

async function openShareModal(article) {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const canvas = drawShareCard(article);
  if (!canvas) return;

  const existing = document.getElementById('share-modal');
  if (existing) existing.remove();

  const dataUrl = canvas.toDataURL('image/png');
  const imageFile = dataUrlToFile(dataUrl, `achgz-${article.slug}-story.png`);
  const canShare = navigator.share && navigator.canShare?.({ files: [imageFile] });

  const modal = document.createElement('div');
  modal.id = 'share-modal';
  modal.className = 'share-modal';
  modal.innerHTML = `
    <div class="share-modal-backdrop" aria-hidden="true"></div>
    <div class="share-modal-content">
      <h4 class="share-modal-title">Share to Instagram Stories</h4>
      <p class="share-modal-hint">${canShare ? 'Tap Share to open your share options (Instagram, etc.) or download the image.' : 'Save the image below and post it to your Instagram story.'}</p>
      <div class="share-preview">
        <img src="${dataUrl}" alt="Article share card" />
      </div>
      <div class="share-modal-actions">
        ${canShare ? `<button type="button" class="btn btn-primary share-to-app">Share to Instagram</button>` : ''}
        <a href="${dataUrl}" download="achgz-${article.slug}-story.png" class="btn ${canShare ? 'btn-outline' : 'btn-primary'} share-download">Download image</a>
        <button type="button" class="btn btn-outline share-close">Close</button>
      </div>
    </div>
  `;

  if (canShare) {
    modal.querySelector('.share-to-app').addEventListener('click', async () => {
      const ok = await shareToStories(imageFile, article);
      if (ok) close();
    });
  }

  const close = () => {
    modal.remove();
    document.removeEventListener('keydown', onKeydown);
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  modal.querySelector('.share-modal-backdrop').addEventListener('click', close);
  modal.querySelector('.share-close').addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);
  document.body.appendChild(modal);
}

function updateActiveCard(slug) {
  articlesList?.querySelectorAll('.article-card').forEach(card => {
    card.classList.toggle('active', card.dataset.slug === slug);
  });
}

window.addEventListener('hashchange', () => {
  fetch(DATA_URL).then(r => r.json()).then(data => {
    const slug = getSlugFromHash();
    if (slug && data.articles) showArticle(slug, data.articles);
    else {
      articleView.innerHTML = '';
      articleView.classList.remove('visible');
      if (articlesLayout) articlesLayout.classList.remove('article-active');
      document.body.classList.remove('article-viewing');
      updateActiveCard(null);
    }
  });
});

loadArticles();
