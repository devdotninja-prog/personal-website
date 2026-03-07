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
      <h2 class="article-full-title">${article.title}</h2>
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
