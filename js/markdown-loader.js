document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('markdown-content');
    if (!container) return;

    const mdPath = container.dataset.md;
    if (!mdPath) {
        container.innerHTML = '<p style="color:#b33;">未指定 Markdown 文件路径</p>';
        return;
    }

    try {
        const res = await fetch(mdPath);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();

        if (typeof marked !== 'undefined') {
            container.innerHTML = marked.parse(text);
        } else {
            container.innerHTML = '<pre style="white-space:pre-wrap;">' +
                text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>';
        }
    } catch (err) {
        container.innerHTML = '<p style="color:#b33;">介绍加载失败：' + err.message +
            '。请通过本地服务器预览（直接双击打开受浏览器限制）。</p>';
    }
});
