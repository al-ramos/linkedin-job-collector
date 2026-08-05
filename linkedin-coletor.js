(async () => {
  if (!location.hostname.endsWith('linkedin.com')) return alert('Execute este coletor em uma página do LinkedIn.');
  if (window.__coletorVagasAtivo) return alert('O coletor já está em execução.');
  window.__coletorVagasAtivo = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clean = value => (value || '').replace(/\s+/g, ' ').trim();
  const firstText = selectors => {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && clean(el.innerText)) return clean(el.innerText);
    }
    return '';
  };
  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483647;background:#0a66c2;color:#fff;padding:16px 18px;border-radius:12px;box-shadow:0 8px 30px #0005;font:600 14px system-ui;max-width:360px';
  document.body.appendChild(panel);
  const status = text => panel.textContent = text;

  try {
    status('Carregando todos os cartões visíveis…');
    const list = document.querySelector('.jobs-search-results-list') || document.querySelector('[class*="jobs-search-results-list"]') || document.scrollingElement;
    let stable = 0, previous = 0;
    for (let i = 0; i < 30 && stable < 4; i++) {
      list.scrollTop = list.scrollHeight;
      await sleep(900);
      const count = document.querySelectorAll('[data-occludable-job-id], [data-job-id]').length;
      stable = count === previous ? stable + 1 : 0;
      previous = count;
    }

    const nodes = [...document.querySelectorAll('[data-occludable-job-id], [data-job-id]')];
    const cards = [...new Map(nodes.map(node => {
      const card = node.closest('li') || node;
      const id = node.getAttribute('data-occludable-job-id') || node.getAttribute('data-job-id') || card.querySelector('[data-job-id]')?.getAttribute('data-job-id');
      return id ? [id, card] : null;
    }).filter(Boolean)).values()];
    if (!cards.length) throw new Error('Nenhum cartão de vaga foi encontrado. Confirme se a lista de resultados está aberta.');

    const jobs = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      status(`Lendo vaga ${i + 1} de ${cards.length}…`);
      card.scrollIntoView({block:'center'});
      const link = card.querySelector('a[href*="/jobs/view/"]');
      (link || card).click();
      await sleep(1300);
      const id = card.querySelector('[data-occludable-job-id], [data-job-id]')?.getAttribute('data-occludable-job-id') || card.querySelector('[data-job-id]')?.getAttribute('data-job-id') || (link?.href.match(/\/jobs\/view\/(\d+)/) || [])[1] || '';
      jobs.push({
        titulo: firstText(['.job-details-jobs-unified-top-card__job-title h1','.jobs-unified-top-card__job-title','h1']),
        empresa: firstText(['.job-details-jobs-unified-top-card__company-name','.jobs-unified-top-card__company-name']),
        local: firstText(['.job-details-jobs-unified-top-card__primary-description-container','.jobs-unified-top-card__bullet']),
        descricao: firstText(['.jobs-description__content','.jobs-box__html-content','.jobs-description-content__text']),
        link: id ? `https://www.linkedin.com/jobs/view/${id}/` : (link?.href || location.href),
        coletado_em: new Date().toISOString()
      });
    }

    const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const columns = ['titulo','empresa','local','descricao','link','coletado_em'];
    const csv = '\uFEFF' + [columns.join(';'), ...jobs.map(j => columns.map(c => escapeCsv(j[c])).join(';'))].join('\r\n');
    const download = (content, type, name) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([content], {type}));
      a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    };
    const stamp = new Date().toISOString().slice(0,10);
    download(csv, 'text/csv;charset=utf-8', `vagas-linkedin-${stamp}.csv`);
    await sleep(400);
    download(JSON.stringify(jobs, null, 2), 'application/json', `vagas-linkedin-${stamp}.json`);
    status(`Concluído: ${jobs.length} vagas exportadas em CSV e JSON.`);
  } catch (error) {
    console.error(error);
    status(`Não foi possível concluir: ${error.message}`);
  } finally {
    window.__coletorVagasAtivo = false;
  }
})();
