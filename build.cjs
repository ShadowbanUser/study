const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { gzipSync, gunzipSync } = require('node:zlib');

if (!process.argv[2]) {
  console.error('Usage: node build.cjs <path-to-original-html>');
  process.exit(1);
}

const original = fs.readFileSync(path.resolve(process.argv[2]), 'utf8');
const papers = [
  ['真题（合并重排）', 'past-papers', '真题_合并重排'],
  ['模拟题 A', 'mock-a', '模拟题_A'],
  ['模拟题 B', 'mock-b', '模拟题_B'],
];
const rows = papers.map(([label, slug, filename]) => {
  const links = [['questions', '题目'], ['solutions', '解析']].map(([kind, name]) => {
    const file = `${slug}-${kind}.pdf`;
    const pdf = fs.readFileSync(path.join(__dirname, 'comporg', 'downloads', file));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', `Invalid PDF: ${file}`);
    return `<td><a href="./downloads/${file}" download="${filename}_${name}.pdf" aria-label="下载${label}${name} PDF">下载${name} PDF</a></td>`;
  });
  return `<tr><th scope="row">${label}</th>${links.join('')}</tr>`;
}).join('\n');
const downloads = `<section class="chapter" id="downloads" data-num="" data-title="资料下载">
  <header class="chap-head">
    <div class="chap-kicker">配套资料 · PDF</div>
    <h1 class="chap-title">资料下载</h1>
    <p class="chap-lead">下载题目离线练习，完成后再查看解析。</p>
  </header>
  <table class="tight">
    <thead><tr><th scope="col">资料</th><th scope="col">题目</th><th scope="col">解析</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
const endOfPage = /\r?\n<\/div>\s*<script>/g;
assert.equal([...original.matchAll(endOfPage)].length, 1, 'Expected one final page wrapper');
const course = Buffer.from(original.replace(endOfPage, match => `\n${downloads}\n${match}`));
const compressed = gzipSync(course, { level: 9 });
assert.deepEqual(gunzipSync(compressed), course);

// Compression and encoding keep the original out of the published HTML;
// they do not provide encryption or prevent recovery by visitors.
const html = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>计算机组成原理 · Study</title>
<style>body{margin:3rem;font:16px/1.7 system-ui,sans-serif;background:#f5f3ec;color:#24352f}</style>
<p role="status" id="status">正在打开学习页面……</p>
<noscript>请启用 JavaScript 后打开学习页面。</noscript>
<script>
(async()=>{
  try {
    if (!('DecompressionStream' in window)) throw new Error('unsupported');
    const bytes=Uint8Array.from(atob('${compressed.toString('base64')}'),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const html=await new Response(stream).text();
    document.open();
    document.write(html);
    document.close();
    if(location.hash) requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
  } catch(error) {
    const status=document.getElementById('status');
    if(status) status.textContent='页面加载失败，请刷新重试，或使用最新版 Chrome、Edge、Firefox、Safari。';
    console.error('Study page could not be opened',error);
  }
})();
</script>
</html>
`;

fs.mkdirSync(path.join(__dirname, 'comporg'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'comporg', 'index.html'), html);
console.log(`Built comporg/index.html: ${course.length} → ${Buffer.byteLength(html)} bytes; round-trip and six PDF files verified.`);
