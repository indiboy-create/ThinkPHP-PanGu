import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SRC_DIR = path.join(ROOT, 'src');
export const DIST_DIR = path.join(ROOT, 'dist');

export const STATIC_PAGES = ['index.html', 'packages.html', 'projects.html', 'about.html'];
export const ALL_PAGES = STATIC_PAGES.concat(['package.html', 'project.html', '404.html']);

export function loadSiteData() {
  const file = path.join(SRC_DIR, 'static', 'js', 'data.js');
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: 'src/static/js/data.js' });
  if (!sandbox.window.PANGU) {
    throw new Error('data.js 未挂载 window.PANGU');
  }
  return sandbox.window.PANGU;
}

export function siteBase(data) {
  const url = data.site && data.site.url;
  if (!url) throw new Error('data.site.url 未配置');
  return url.replace(/\/+$/, '');
}

export function siteUrls(data) {
  const base = siteBase(data);
  return [
    base + '/',
    ...STATIC_PAGES.filter((page) => page !== 'index.html').map((page) => base + '/' + page),
    ...data.packages.map((pkg) => base + '/package.html?name=' + encodeURIComponent(pkg.name)),
    ...data.projects.map((project) => base + '/project.html?slug=' + encodeURIComponent(project.slug)),
  ];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSitemap(data, lastmod) {
  const urls = siteUrls(data);
  const now = new Date();
  const date =
    lastmod ||
    [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join(
      '-'
    );
  const entries = urls
    .map(
      (url) =>
        '  <url>\n' +
        '    <loc>' +
        escapeXml(url) +
        '</loc>\n' +
        '    <lastmod>' +
        date +
        '</lastmod>\n' +
        '  </url>'
    )
    .join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries +
    '\n' +
    '</urlset>\n'
  );
}