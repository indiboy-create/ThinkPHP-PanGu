import fs from 'node:fs';
import path from 'node:path';
import { DIST_DIR, buildSitemap, loadSiteData, siteBase } from './lib.mjs';

const data = loadSiteData();
const target = path.join(DIST_DIR, 'sitemap.xml');

fs.mkdirSync(DIST_DIR, { recursive: true });
fs.writeFileSync(target, buildSitemap(data), 'utf8');

const total = data.packages.length + data.projects.length + 4;
console.log('sitemap: ' + path.relative(process.cwd(), target));
console.log('site:    ' + siteBase(data) + '/');
console.log('urls:    ' + total + '（4 个静态页 + ' + data.packages.length + ' 个组件 + ' + data.projects.length + ' 个项目）');