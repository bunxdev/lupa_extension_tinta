(() => {
  if (window.__tinta) return;

  const VERSION = '0.2.0';

  const buildTurndown = () => {
    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '_',
    });
    // Detectar lenguaje de bloques de código por la convención
    // habitual class="language-X" / class="hljs language-X" / "lang-X".
    td.addRule('fenced-code-with-lang', {
      filter: (node) =>
        node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE',
      replacement: (_content, node) => {
        const code = node.firstChild;
        const cls = (code.getAttribute('class') || '').toLowerCase();
        const m = cls.match(/(?:^|\s)(?:language-|lang-|hljs[- ])([a-z0-9+-]+)/);
        const lang = m ? m[1] : '';
        const text = code.textContent.replace(/\n+$/, '');
        return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
      },
    });
    return td;
  };

  const yaml = (s) =>
    s == null
      ? ''
      : `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

  const extractMeta = () => {
    const get = (sel) => document.querySelector(sel)?.getAttribute('content') || null;
    return {
      published:
        get('meta[property="article:published_time"]') ||
        get('meta[name="pubdate"]') ||
        get('meta[name="date"]') ||
        get('meta[itemprop="datePublished"]') ||
        null,
      description: get('meta[name="description"]') || get('meta[property="og:description"]') || null,
    };
  };

  const buildFrontmatter = (article, meta) => {
    const lines = ['---'];
    if (article.title) lines.push(`title: ${yaml(article.title)}`);
    if (article.byline) lines.push(`byline: ${yaml(article.byline)}`);
    if (article.siteName) lines.push(`site: ${yaml(article.siteName)}`);
    if (article.lang) lines.push(`lang: ${yaml(article.lang)}`);
    if (meta.published) lines.push(`published: ${yaml(meta.published)}`);
    if (article.excerpt) lines.push(`excerpt: ${yaml(article.excerpt)}`);
    lines.push(`url: ${yaml(article.url)}`);
    lines.push(`extracted: ${yaml(new Date().toISOString())}`);
    lines.push('---', '');
    return lines.join('\n');
  };

  const extract = (opts) => {
    const includeFm = !opts || opts.frontmatter !== false;
    const doc = document.cloneNode(true);
    const article = new Readability(doc).parse();
    if (!article) return null;

    const meta = extractMeta();
    const out = {
      title: article.title || document.title,
      byline: article.byline || null,
      siteName: article.siteName || null,
      lang: article.lang || document.documentElement.lang || null,
      url: location.href,
      excerpt: article.excerpt || meta.description || null,
      published: meta.published,
      length: article.length || 0,
    };
    const body = buildTurndown().turndown(article.content);
    out.markdown = includeFm ? buildFrontmatter(out, meta) + body : body;
    return out;
  };

  window.__tinta = { extract, version: VERSION };
})();
