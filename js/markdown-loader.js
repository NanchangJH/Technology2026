/* 动态加载 marked 4.3.0（多 CDN 回退），再渲染成员 md */
function loadMarked() {
    return new Promise((resolve, reject) => {
        // 已经有可用的 marked 就直接用
        if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
            resolve();
            return;
        }
        const cdns = [
            'https://cdn.jsdelivr.net/npm/marked@4.3.0/marked.min.js',
            'https://unpkg.com/marked@4.3.0/marked.min.js',
            'https://cdn.bootcdn.net/ajax/libs/marked/4.3.0/marked.min.js'
        ];
        let i = 0;
        function tryNext() {
            if (i >= cdns.length) {
                reject(new Error('marked.js 三个 CDN 均加载失败'));
                return;
            }
            const s = document.createElement('script');
            s.src = cdns[i++];
            s.onload = () => {
                if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
                    resolve();
                } else {
                    tryNext();
                }
            };
            s.onerror = tryNext;
            document.head.appendChild(s);
        }
        tryNext();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('markdown-content');
    if (!container) return;

    const mdPath = container.dataset.md;
    if (!mdPath) {
        container.innerHTML = '<p style="color:#b33;padding:1rem;">未指定 Markdown 文件路径（data-md 缺失）</p>';
        return;
    }

    try {
        // 1) 加载 marked
        await loadMarked();

        // 2) 拉取 md
        const res = await fetch(mdPath);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();

        console.log('[member] marked 可用:', typeof marked !== 'undefined', marked && marked.version);
        console.log('[member] md 路径:', mdPath);
        console.log('[member] md 状态:', res.status);

        // 3) 渲染（兼容不同版本 API）
        const html = typeof marked.parse === 'function' ? marked.parse(text) : marked(text);
        container.innerHTML = html;

        // 4) 自检：如果没生成任何 Markdown 标签，提示并降级
        if (container.querySelectorAll('h1,h2,h3,ul,ol,strong,code,blockquote').length === 0 && text.trim().length > 0) {
            container.innerHTML = '<p style="color:#b33;padding:1rem;">marked 已加载但未解析出 HTML。</p>' +
                '<pre style="white-space:pre-wrap;">' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>';
        }
    } catch (err) {
        container.innerHTML = '<p style="color:#b33;padding:1rem;">介绍加载失败：' + err.message +
            '<br>md 路径：' + mdPath +
            '<br>请确认文件存在，并通过本地服务器或 GitHub Pages 访问。</p>';
    }
});
