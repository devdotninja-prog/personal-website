// Fetch and render data from JSON - LLM Thinking theme
const DATA_URL = 'data/data.json';

const heroName = document.querySelector('.hero-name');
const heroTagline = document.querySelector('.hero-tagline');
const aboutBio = document.querySelector('.about-bio');
const skillsList = document.getElementById('skills-list');
const projectsGrid = document.getElementById('projects-grid');
const timeline = document.getElementById('timeline');
const contactText = document.querySelector('.contact-text');
const contactLinks = document.getElementById('contact-links');
const footerName = document.getElementById('footer-name');
const yearEl = document.getElementById('year');
const thinkingBar = document.getElementById('thinking-bar');

const responseBlocks = [
  { id: 'hero', thinking: 'hero-thinking', content: 'hero-content' },
  { id: 'about', thinking: 'about-thinking', content: 'about-content' },
  { id: 'projects', thinking: 'projects-thinking', content: 'projects-content' },
  { id: 'experience', thinking: 'experience-thinking', content: 'experience-content' },
  { id: 'contact', thinking: 'contact-thinking', content: 'contact-content' },
];

// Reveal response: hide thinking, show content (simulates LLM finishing)
function revealResponse(block, delay = 0) {
  setTimeout(() => {
    const thinkingEl = document.getElementById(block.thinking);
    const contentEl = document.getElementById(block.content);
    if (thinkingEl) thinkingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.add('visible');
  }, delay);
}

// Intersection Observer - when section scrolls into view, "generate" the response
const blockObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const block = responseBlocks.find(b => b.id === entry.target.id);
    if (block && block.id !== 'hero' && !entry.target.dataset.revealed) {
      entry.target.dataset.revealed = 'true';
      const idx = responseBlocks.findIndex(b => b.id === block.id);
      revealResponse(block, 300 + idx * 100); // Staggered "thinking" duration
    }
  });
}, { threshold: 0.2 });

responseBlocks.forEach(block => {
  const el = document.getElementById(block.id);
  if (el && block.id !== 'hero') blockObserver.observe(el);
});

// Cursor glow - smooth follow with lag (LLM "attention" / "thinking" feel)
const cursorGlow = document.getElementById('cursor-glow');
const cursorInner = document.getElementById('cursor-glow-inner');
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
let innerX = 0, innerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;
  innerX += (mouseX - innerX) * 0.18;
  innerY += (mouseY - innerY) * 0.18;

  if (cursorGlow) {
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
  }
  if (cursorInner) {
    cursorInner.style.left = innerX + 'px';
    cursorInner.style.top = innerY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

// Hide global thinking bar and move nav up
setTimeout(() => {
  if (thinkingBar) thinkingBar.classList.add('hidden');
  document.body.classList.add('thinking-done');
}, 1200);

// Load and render data
async function loadData() {
  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();

    heroName.textContent = data.profile.name;
    heroTagline.textContent = data.profile.tagline;
    aboutBio.textContent = data.profile.bio;

    const imagePlaceholder = document.querySelector('.about-image .image-placeholder');
    if (imagePlaceholder && data.profile.avatar) {
      const img = document.createElement('img');
      img.src = data.profile.avatar;
      img.alt = data.profile.name;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      imagePlaceholder.replaceWith(img);
    }

    // Skills as tags (stream in when visible)
    skillsList.innerHTML = data.skills.map((skill, i) => {
      const name = typeof skill === 'string' ? skill : skill.name;
      return `<span class="skill-tag" style="transition-delay: ${i * 0.05}s">${name}</span>`;
    }).join('');

    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-tag').forEach(tag => tag.classList.add('visible'));
        }
      });
    }, { threshold: 0.3 });
    const aboutContent = document.getElementById('about-content');
    if (aboutContent) skillsObserver.observe(aboutContent);

    // Projects
    projectsGrid.innerHTML = data.projects.map((project, i) => `
      <article class="project-card" style="transition-delay: ${i * 0.08}s">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-tags">
          ${project.technologies.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noopener">Live Demo</a>` : ''}
          ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener">GitHub</a>` : ''}
        </div>
      </article>
    `).join('');

    document.querySelectorAll('.project-card').forEach(card => {
      const cardObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.1 });
      cardObs.observe(card);
    });

    // Experience
    timeline.innerHTML = data.experience.map(exp => `
      <div class="timeline-item">
        <div class="timeline-date">${exp.period}</div>
        <h3 class="timeline-title">${exp.title}</h3>
        <div class="timeline-company">${exp.company}</div>
        <p class="timeline-desc">${exp.description}</p>
      </div>
    `).join('');

    document.querySelectorAll('.timeline-item').forEach(item => {
      const itemObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.1 });
      itemObs.observe(item);
    });

    contactText.textContent = data.profile.contactText;
    contactLinks.innerHTML = data.contact.map(c => {
      const isExternal = c.url.startsWith('http');
      return `<a href="${c.url}" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>${c.icon || '→'} ${c.label}</a>`;
    }).join('');

    footerName.textContent = data.profile.name;
    yearEl.textContent = new Date().getFullYear();

    // Reveal hero immediately (data loaded)
    revealResponse(responseBlocks[0], 600);

    // If page loaded with hash (e.g. from articles.html), scroll to section after content renders
    const hash = (location.hash || '').replace('#', '');
    if (hash) {
      const targetBlock = responseBlocks.find(b => b.id === hash);
      const targetEl = document.getElementById(hash);
      if (targetBlock && targetEl && targetBlock.id !== 'hero') {
        targetEl.dataset.revealed = 'true';
        // Reveal this section and all sections before it so layout is correct
        const targetIdx = responseBlocks.findIndex(b => b.id === hash);
        for (let i = 1; i <= targetIdx; i++) {
          revealResponse(responseBlocks[i], 50 * i);
        }
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  } catch (err) {
    console.error('Failed to load data:', err);
    heroName.textContent = 'Error loading data';
    heroTagline.textContent = 'Please ensure data.json exists.';
    revealResponse(responseBlocks[0], 0);
  }
}

// Handle hash on load (e.g. index.html#experience from another page)
function scrollToHash() {
  const hash = (location.hash || '').replace('#', '');
  if (!hash) return;
  const el = document.getElementById(hash);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

window.addEventListener('hashchange', scrollToHash);
loadData().then(() => scrollToHash());
