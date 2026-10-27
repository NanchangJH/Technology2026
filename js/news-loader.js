document.addEventListener('DOMContentLoaded', async () => {
    const listEl = document.getElementById('news-list');
    const countEl = document.getElementById('news-count');
    if (!listEl) return;

    try {
        const res = await fetch('news/articles.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const articles = await res.json();

        // 按日期倒序
        articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        if (countEl) countEl.textContent = articles.length;

        if (articles.length === 0) {
            listEl.innerHTML = '<p style="color:#4a6d92;padding:1rem;">暂无文章</p>';
            return;
        }

        listEl.innerHTML = articles.map(a => `
            <a class="news-item" href="pages/news-article.html?file=${encodeURIComponent(a.file)}&title=${encodeURIComponent(a.title || '')}">
                <div class="news-date">
                    <span class="news-day">${(a.date || '').slice(8, 10) || '--'}</span>
                    <span class="news-ym">${(a.date || '').slice(0, 7) || ''}</span>
                </div>
                <div class="news-content">
                    <h3 class="news-title">${escapeHtml(a.title || '无标题')}</h3>
                    <p class="news-summary">${escapeHtml(a.summary || '')}</p>
                </div>
                <div class="news-arrow"><i class="fas fa-arrow-right"></i></div>
            </a>
        `).join('');
    } catch (err) {
        listEl.innerHTML = '<p style="color:#b33;padding:1rem;">新闻列表加载失败：' + err.message + '。请确认 news/articles.json 存在且通过本地服务器预览。</p>';
    }
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
