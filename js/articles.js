document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initScrollAnimations();
  loadArticles();
});

const DATA_URL = 'data/data.json';

function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (!toggle || !navLinks) return;
  
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    toggle.classList.toggle('active');
  });
  
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      toggle.classList.remove('active');
    });
  });
}

function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getSlugFromHash() {
  return (location.hash || '').replace('#', '');
}

async function loadArticles() {
  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    const articles = data.articles || [];
    
    renderArticleList(articles);
    initTopicFilter(articles);
    
    const slug = getSlugFromHash();
    if (slug) {
      showArticle(slug, articles);
    }
    
    window.addEventListener('hashchange', () => {
      const newSlug = getSlugFromHash();
      if (newSlug) {
        showArticle(newSlug, articles);
      } else {
        hideArticle();
      }
    });
    
  } catch (e) {
    console.error('Failed to load articles:', e);
    document.getElementById('articles-list').innerHTML = 
      '<p class="article-empty">Failed to load articles.</p>';
  }
}

function renderArticleList(articles, filter = 'all') {
  const listEl = document.getElementById('articles-list');
  
  const filtered = filter === 'all' 
    ? articles 
    : articles.filter(a => a.tags && a.tags.some(t => t.toLowerCase() === filter.toLowerCase()));
  
  if (filtered.length === 0) {
    listEl.innerHTML = '<p class="article-empty">No articles found for this topic.</p>';
    return;
  }
  
  listEl.innerHTML = filtered.map((article, index) => `
    <article class="article-card" data-slug="${article.slug}" style="transition-delay: ${index * 0.1}s">
      <h3 class="article-title">${article.title}</h3>
      <p class="article-excerpt">${article.excerpt}</p>
      <div class="article-meta">
        <span class="article-date">${formatDate(article.date)}</span>
        <div class="article-tags">
          ${(article.tags || []).map(t => `<span class="article-tag">${t}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
  
  listEl.querySelectorAll('.article-card').forEach(card => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    obs.observe(card);
    
    card.addEventListener('click', () => {
      const slug = card.dataset.slug;
      history.pushState(null, '', `#${slug}`);
      showArticle(slug, articles);
    });
  });
}

function initTopicFilter(articles) {
  const filterEl = document.getElementById('topic-filter');
  if (!filterEl) return;
  
  filterEl.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterEl.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const topic = btn.dataset.topic;
      hideArticle();
      renderArticleList(articles, topic);
    });
  });
}

function showArticle(slug, articles) {
  const article = articles.find(a => a.slug === slug);
  const viewEl = document.getElementById('article-view');
  const listEl = document.getElementById('articles-list');
  
  if (!article) {
    hideArticle();
    return;
  }
  
  viewEl.innerHTML = `
    <a href="#" class="article-back" id="back-btn">← Back to articles</a>
    <h2 class="article-full-title">${article.title}</h2>
    <div class="article-full-meta">
      <span class="article-date">${formatDate(article.date)}</span>
      <div class="article-tags">
        ${(article.tags || []).map(t => `<span class="article-tag">${t}</span>`).join('')}
      </div>
    </div>
    <div class="article-full-content">${article.content}</div>
  `;
  
  viewEl.classList.add('visible');
  listEl.style.display = 'none';
  
  document.querySelectorAll('.article-card').forEach(card => {
    card.classList.toggle('active', card.dataset.slug === slug);
  });
  
  document.getElementById('back-btn').addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', window.location.pathname);
    hideArticle();
  });
  
  viewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideArticle() {
  const viewEl = document.getElementById('article-view');
  const listEl = document.getElementById('articles-list');
  
  viewEl.classList.remove('visible');
  viewEl.innerHTML = '';
  listEl.style.display = 'flex';
  
  document.querySelectorAll('.article-card').forEach(card => {
    card.classList.remove('active');
  });
}
