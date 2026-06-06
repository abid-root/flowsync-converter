import { categoryDefaults, conversions, formats } from './data.js';

export function slugFromPair(from, to) {
  return `${from}-to-${to}`;
}

export function pairFromSlug(slug) {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  const match = clean.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/i);
  if (!match) return null;
  const from = match[1].toLowerCase();
  const to = match[2].toLowerCase();
  if (!formats[from] || !formats[to]) return null;
  return { from, to };
}

export function categoryFromPath(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const route = clean.split('/').pop() || '';
  if (route.endsWith('-converter')) {
    const category = route.replace('-converter', '');
    if (categoryDefaults[category]) return category;
  }
  return null;
}

export function initialStateFromPath() {
  const path = window.location.pathname;
  const route = path.replace(/^\/+|\/+$/g, '').split('/').pop() || '';
  const pair = pairFromSlug(route);
  if (pair) {
    const fallback = conversions[pair.from]?.[0] || pair.to;
    return {
      category: formats[pair.from].category,
      from: pair.from,
      to: conversions[pair.from]?.includes(pair.to) ? pair.to : fallback
    };
  }

  const category = categoryFromPath(path) || 'image';
  const [from, to] = categoryDefaults[category] || categoryDefaults.image;
  return { category, from, to };
}

export function updateBrowserUrl(from, to, replace = false) {
  const slug = `${basePath()}${slugFromPair(from, to)}/`;
  if (window.location.protocol === 'file:') return;
  if (replace && isLandingPath(window.location.pathname)) return;
  if (window.location.pathname === slug) return;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({ from, to }, '', slug);
}

function basePath() {
  const script = document.querySelector('script[src$="assets/js/app.js"]');
  const source = script?.getAttribute('src') || '';

  if (source.startsWith('/')) {
    return source.replace(/assets\/js\/app\.js.*$/, '');
  }

  const clean = window.location.pathname.replace(/\/index\.html$/i, '/');
  const parts = clean.split('/').filter(Boolean);
  const route = parts.at(-1) || '';

  if (!route || pairFromSlug(route) || categoryFromPath(route)) {
    parts.pop();
  }

  return `/${parts.join('/')}${parts.length ? '/' : ''}`;
}

function isLandingPath(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const route = clean.split('/').pop() || '';
  if (!clean || route.toLowerCase() === 'index.html') return true;
  if (!pairFromSlug(route) && !categoryFromPath(pathname)) return true;
  return Boolean(categoryFromPath(pathname));
}

export function updateMeta(from, to) {
  const fromLabel = formats[from]?.label || from.toUpperCase();
  const toLabel = formats[to]?.label || to.toUpperCase();
  const title = `${fromLabel} to ${toLabel} Converter | FlowSync`;
  document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.content = `Convert ${fromLabel} files to ${toLabel} online with FlowSync. Upload files, choose output settings, and prepare clean conversions.`;
  }
}
