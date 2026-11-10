import { rm, cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { relative, extname, join } from 'node:path';
import { minify as terserMinify } from 'terser';
import CleanCSS from 'clean-css';
import { DIST_DIR, SRC_DIR, buildSitemap, loadSiteData } from './lib.mjs';

// 第三方目录：原样拷贝，不压缩
const SKIP_PREFIXES = ['component/layui/'];

const cleanCss = new CleanCSS({ level: 2 });

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function minify() {
  const files = await walk(DIST_DIR);
  let jsCount = 0;
  let cssCount = 0;

  for (const file of files) {
    const rel = relative(DIST_DIR, file).replace(/\\/g, '/');
    if (SKIP_PREFIXES.some((prefix) => rel.startsWith(prefix))) continue;

    const ext = extname(file).toLowerCase();
    if (ext !== '.js' && ext !== '.css') continue;

    const content = await readFile(file, 'utf8');
    if (ext === '.js') {
      const result = await terserMinify(content, { compress: true, mangle: true });
      if (result.code) {
        await writeFile(file, result.code);
        jsCount += 1;
      }
    } else {
      const result = cleanCss.minify(content);
      if (!result.errors.length) {
        await writeFile(file, result.styles);
        cssCount += 1;
      }
    }
  }

  return { jsCount, cssCount };
}

async function generateArtifacts() {
  const data = loadSiteData();
  await writeFile(join(DIST_DIR, 'sitemap.xml'), buildSitemap(data), 'utf8');
  await writeFile(join(DIST_DIR, '.nojekyll'), '');
  return data;
}

await rm(DIST_DIR, { recursive: true, force: true });
await cp(SRC_DIR, DIST_DIR, { recursive: true });

const result = await minify();
const data = await generateArtifacts();

console.log('构建完成：' + DIST_DIR);
console.log('  组件：' + data.packages.length + ' 个');
console.log('  项目：' + data.projects.length + ' 个');
console.log('  压缩：' + result.jsCount + ' 个 JS / ' + result.cssCount + ' 个 CSS（Layui 原样保留）');
console.log('  产物：sitemap.xml、.nojekyll');