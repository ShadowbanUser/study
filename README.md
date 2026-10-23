# Study

独立学习空间：https://shadowbanuser.github.io/study/

计算机组成原理：https://shadowbanuser.github.io/study/comporg/

原始课程 HTML 保留在本机，不提交到本仓库。`comporg/index.html` 只包含加载器及 gzip 压缩后以 Base64 编码的课程内容，浏览器自动还原，无需密码。这不是加密，访问者仍可还原内容和源码。

更新课程（需要 Node.js，不需要安装依赖）：

```powershell
node build.cjs '原始课程 HTML 的本地完整路径'
git add comporg/index.html
git commit -m "Update computer organization course"
git push
```

构建时会在讲义末尾添加资料下载区，并校验压缩前后逐字节一致及六份 PDF 文件有效。只提交发布文件，不要把原始 HTML 放入 Git 历史。GitHub Pages 使用 `main` 分支根目录发布。

配套 PDF 保存在 `comporg/downloads/`，包括真题、模拟题 A 和模拟题 B 各自的题目与解析。点击网页末尾的链接即可下载，保存时使用原中文文件名。

页面使用浏览器原生 `DecompressionStream`，需要现代浏览器。学习勾选进度保存在当前浏览器本机，不跨设备同步。
