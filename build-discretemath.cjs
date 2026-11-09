const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { gzipSync, gunzipSync } = require('node:zlib');

const sourcePath = process.argv[2] || 'A:/素材/离散数学_全部资料/离散数学_考试通关手册.html';
const original = fs.readFileSync(path.resolve(sourcePath));
const compressed = gzipSync(original, { level: 9 });
assert.deepEqual(gunzipSync(compressed), original);

const html = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>离散数学 · Study</title>
<style>body{margin:3rem;font:16px/1.7 system-ui,sans-serif;background:#f5f3ec;color:#24352f}</style>
<p role="status" id="status">正在打开离散数学学习手册……</p>
<noscript>请启用 JavaScript 后打开学习手册。</noscript>
<script>
(async()=>{
  try {
    if (!('DecompressionStream' in window)) throw new Error('unsupported');
    const bytes=Uint8Array.from(atob('${compressed.toString('base64')}'),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    document.open();
    document.write(await new Response(stream).text());
    document.close();
    if(location.hash) requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
  } catch(error) {
    const status=document.getElementById('status');
    if(status) status.textContent='页面加载失败，请刷新重试，或使用最新版浏览器。';
    console.error('Study page could not be opened',error);
  }
})();
</script>
</html>
`;

const output = path.join(__dirname, 'discretemath', 'index.html');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
console.log(`Built discretemath/index.html: ${original.length} → ${Buffer.byteLength(html)} bytes; round-trip verified.`);
