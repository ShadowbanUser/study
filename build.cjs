const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { gzipSync, gunzipSync } = require('node:zlib');

if (!process.argv[2]) {
  console.error('Usage: node build.cjs <path-to-original-html>');
  process.exit(1);
}

const original = fs.readFileSync(path.resolve(process.argv[2]));
const compressed = gzipSync(original, { level: 9 });
assert.deepEqual(gunzipSync(compressed), original);

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
console.log(`Built comporg/index.html: ${original.length} → ${Buffer.byteLength(html)} bytes; round-trip verified.`);
