const $ = (id) => document.getElementById(id);
const status = (msg, isErr = false) => {
  const el = $('status');
  el.textContent = msg;
  el.classList.toggle('error', isErr);
};

const slug = (s) =>
  (s || 'tinta').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);

const buildMarkdown = (article) => {
  const head = [`# ${article.title}`];
  if (article.byline) head.push(`*${article.byline}*`);
  head.push(`\n[fuente](${article.url})\n`);
  return head.join('\n') + '\n' + article.markdown;
};

const extract = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('sin pestaña activa');
  // Sin frontmatter: el popup construye su propio header visible.
  const [{ result, error }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: 'MAIN',
    func: () => window.__tinta?.extract({ frontmatter: false }) ?? null,
  });
  if (error) throw new Error(String(error));
  if (!result) throw new Error('sin contenido legible en esta página');
  return result;
};

let current = null;

const render = (article) => {
  current = article;
  $('meta').textContent = `${article.length} caracteres`;
  $('preview').textContent = buildMarkdown(article);
  $('preview').hidden = false;
  $('copy').disabled = false;
  $('download').disabled = false;
  status(`extraído: ${article.title || 'sin título'}`);
};

$('copy').addEventListener('click', async () => {
  if (!current) return;
  await navigator.clipboard.writeText(buildMarkdown(current));
  status('copiado al portapapeles');
});

$('download').addEventListener('click', () => {
  if (!current) return;
  const blob = new Blob([buildMarkdown(current)], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug(current.title)}.md`;
  a.click();
  URL.revokeObjectURL(url);
  status('descargado');
});

(async () => {
  status('extrayendo…');
  try {
    render(await extract());
  } catch (e) {
    status(e.message, true);
  }
})();
