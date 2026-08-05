const statusElement=document.querySelector('#status');
const searchInput=document.querySelector('#search-url');
const openSearches=document.querySelector('#open-searches');
const showStatus=(text,error=false)=>{statusElement.textContent=text;statusElement.classList.toggle('error',error)};

function listSearches(){
  openSearches.replaceChildren(new Option('Procurando abas do LinkedIn…',''));
  chrome.runtime.sendMessage({type:'LIST_LINKEDIN_SEARCHES'},response=>{
    if(chrome.runtime.lastError||!response?.ok){openSearches.replaceChildren(new Option('Não foi possível consultar as abas',''));return}
    openSearches.replaceChildren();
    if(!response.searches.length){openSearches.add(new Option('Nenhuma pesquisa aberta encontrada',''));return}
    response.searches.forEach(item=>{const option=new Option(`${item.total} — ${item.title}`,item.url);option.dataset.tabId=item.id;openSearches.add(option)});
  });
}

document.querySelector('#refresh-searches').addEventListener('click',listSearches);
document.querySelector('#open-linkedin').addEventListener('click',()=>chrome.tabs.create({url:'https://www.linkedin.com/jobs/search/'}));
document.querySelector('#start').addEventListener('click',()=>{
  const typedUrl=searchInput.value.trim();
  const url=typedUrl||openSearches.value;
  if(!url){showStatus('Abra uma pesquisa do LinkedIn e atualize a lista.',true);return}
  if(!url.startsWith('https://www.linkedin.com/jobs/search/')){showStatus('Informe um link válido da busca de vagas do LinkedIn.',true);return}
  const selected=openSearches.selectedOptions[0];
  const message={type:'START_AUTOMATIC_COLLECTION',url,source:typedUrl?'link informado':selected?.textContent,tabId:typedUrl?null:Number(selected?.dataset.tabId)||null};
  showStatus('Iniciando a coleta de todas as páginas…');
  chrome.runtime.sendMessage(message,response=>{
    if(chrome.runtime.lastError||!response?.ok){showStatus(response?.error||'Não foi possível iniciar a coleta.',true);return}
    showStatus(`Coleta iniciada usando: ${response.source}. Acompanhe a aba do LinkedIn.`);
  });
});

listSearches();
