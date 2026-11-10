import fs from 'node:fs';
import path from 'node:path';
import { ALL_PAGES, DIST_DIR, ROOT, SRC_DIR, loadSiteData, siteBase, siteUrls } from './lib.mjs';

const errors = [];
const data = loadSiteData();
const base = siteBase(data);

const groupKeys = new Set(data.groups.map((group) => group.key));
const packageNames = new Set(data.packages.map((pkg) => pkg.name));
const projectSlugs = new Set(data.projects.map((project) => project.slug));

function fail(message) {
  errors.push(message);
}

function uniqueOrFail(label, values) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) fail(label + ' 重复：' + value);
    seen.add(value);
  }
}

function checkData() {
  uniqueOrFail('组件 key', data.groups.map((group) => group.key));
  uniqueOrFail('组件 name', data.packages.map((pkg) => pkg.name));
  uniqueOrFail('组件 package', data.packages.map((pkg) => pkg.package));
  uniqueOrFail('项目 slug', data.projects.map((project) => project.slug));

  for (const pkg of data.packages) {
    if (!groupKeys.has(pkg.group)) fail('组件 ' + pkg.name + ' 的分类不存在：' + pkg.group);
    if (!pkg.package.startsWith('youvision/')) fail('组件 ' + pkg.name + ' 的 Composer 包名不规范：' + pkg.package);
    if (!pkg.summary) fail('组件 ' + pkg.name + ' 缺少 summary');
    if (!pkg.tags || !pkg.tags.length) fail('组件 ' + pkg.name + ' 缺少 tags');
    if (!pkg.highlights || !pkg.highlights.length) fail('组件 ' + pkg.name + ' 缺少 highlights');
  }

  for (const project of data.projects) {
    if (!project.tagline) fail('项目 ' + project.slug + ' 缺少 tagline');
    if (!project.features || !project.features.length) fail('项目 ' + project.slug + ' 缺少 features');
    for (const related of project.related || []) {
      if (!packageNames.has(related) && !projectSlugs.has(related)) {
        fail('项目 ' + project.slug + ' 关联了不存在的条目：' + related);
      }
    }
  }
}

function checkPages() {
  for (const page of ALL_PAGES) {
    const file = path.join(SRC_DIR, page);
    if (!fs.existsSync(file)) {
      fail('缺少页面：src/' + page);
      continue;
    }

    const html = fs.readFileSync(file, 'utf8');
    const title = html.match(/<title>([\s\S]*?)<\/title>/);
    if (!title || !title[1].trim()) fail(page + ' 缺少 title');
    if (page !== '404.html' && !/<meta\b[^>]*name="description"[^>]*>/.test(html)) {
      fail(page + ' 缺少 description');
    }
    if (!html.includes('component/layui/css/layui.css')) fail(page + ' 未引用 Layui 样式');
    if (!html.includes('static/js/data.js')) fail(page + ' 未引用 data.js');
    if (!html.includes('static/js/site.js')) fail(page + ' 未引用 site.js');

    const markup = html
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '');

    for (const match of markup.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const ref = match[1];
      if (/^(https?:|mailto:|tel:|#|javascript:)/.test(ref)) continue;

      const [pathPart, queryPart] = ref.split('#')[0].split('?');
      if (!pathPart) continue;

      const target = path.join(SRC_DIR, pathPart);
      if (!fs.existsSync(target)) fail(page + ' 引用了不存在的资源：' + ref);

      if (pathPart === 'package.html' && queryPart) {
        const name = new URLSearchParams(queryPart).get('name');
        if (!name || !packageNames.has(name)) fail(page + ' 引用了不存在的组件：' + ref);
      }
      if (pathPart === 'project.html' && queryPart) {
        const slug = new URLSearchParams(queryPart).get('slug');
        if (!slug || !projectSlugs.has(slug)) fail(page + ' 引用了不存在的项目：' + ref);
      }
    }
  }
}

function checkCanonical() {
  for (const page of ALL_PAGES) {
    if (page === '404.html') continue;
    const html = fs.readFileSync(path.join(SRC_DIR, page), 'utf8');
    const expected = page === 'index.html' ? base + '/' : base + '/' + page;
    if (!html.includes('rel="canonical" href="' + expected + '"')) {
      fail(page + ' 的 canonical 应为 ' + expected);
    }
  }
}

function checkSitemap() {
  const file = path.join(DIST_DIR, 'sitemap.xml');
  if (!fs.existsSync(file)) {
    fail('dist/sitemap.xml 不存在，请先执行 npm run build');
    return;
  }

  const xml = fs.readFileSync(file, 'utf8');
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  const expected = siteUrls(data);
  const missing = expected.filter((url) => !locs.includes(url));
  const extra = locs.filter((url) => !expected.includes(url));

  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) fail('sitemap.xml 缺少 XML 声明');
  if (missing.length) fail('sitemap.xml 缺少 ' + missing.length + ' 个地址，例如 ' + missing[0]);
  if (extra.length) fail('sitemap.xml 多出 ' + extra.length + ' 个地址，例如 ' + extra[0]);
  if (!xml.includes('<lastmod>')) fail('sitemap.xml 缺少 lastmod');
}

function checkAssets() {
  const sourceRequired = [
    'component/layui/css/layui.css',
    'component/layui/layui.js',
    'component/layui/font/iconfont.woff2',
    'static/css/site.css',
    'static/js/data.js',
    'static/js/site.js',
    'favicon.svg',
    'robots.txt',
  ];
  for (const asset of sourceRequired) {
    if (!fs.existsSync(path.join(SRC_DIR, asset))) fail('缺少源资源：src/' + asset);
  }

  const distRequired = ['index.html', '404.html', 'sitemap.xml', '.nojekyll', 'static/js/site.js'];
  for (const asset of distRequired) {
    if (!fs.existsSync(path.join(DIST_DIR, asset))) fail('缺少构建产物：dist/' + asset + '（请先执行 npm run build）');
  }

  const distSite = path.join(DIST_DIR, 'static', 'js', 'site.js');
  if (fs.existsSync(distSite)) {
    const source = fs.readFileSync(path.join(SRC_DIR, 'static', 'js', 'site.js'), 'utf8');
    const built = fs.readFileSync(distSite, 'utf8');
    if (built.length >= source.length) fail('dist/static/js/site.js 未被压缩，请检查构建脚本');
  }
}

checkData();
checkPages();
checkCanonical();
checkSitemap();
checkAssets();

if (errors.length) {
  console.error('✖ 站点校验失败（' + errors.length + ' 项）');
  for (const message of errors) console.error('  - ' + message);
  process.exit(1);
}

console.log('✔ 站点校验通过');
console.log('  页面：' + ALL_PAGES.length + ' 个');
console.log('  组件：' + data.packages.length + ' 个（' + data.groups.length + ' 个分类）');
console.log('  项目：' + data.projects.length + ' 个');
console.log('  Sitemap：' + siteUrls(data).length + ' 个地址');
console.log('  站点：' + base + '/');
console.log('  源码：' + path.relative(ROOT, SRC_DIR) + '  产物：' + path.relative(ROOT, DIST_DIR));