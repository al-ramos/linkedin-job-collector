const statusElement=document.querySelector('#status');
const searchInput=document.querySelector('#search-url');
const openSearches=document.querySelector('#open-searches');
const stackOptions=document.querySelector('#stack-options');
const DEFAULTS={selectedStacks:[],customTerms:'',downloadFiles:true,sendRadar:false,downloadFolder:'RadarCarreira',portalUrl:'https://radar-carreira-almir-v2.prof-andreiamr.chatgpt.site/api/collector/import',portalToken:''};
const showStatus=(text,error=false)=>{statusElement.textContent=text;statusElement.classList.toggle('error',error)};

globalThis.STACK_CATALOG.forEach(stack=>{const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.value=stack.id;label.append(input,document.createTextNode(stack.label));stackOptions.append(label)});

function readSettings(){return{selectedStacks:[...stackOptions.querySelectorAll('input:checked')].map(input=>input.value),customTerms:document.querySelector('#custom-terms').value.trim(),downloadFiles:document.querySelector('#download-files').checked,sendRadar:document.querySelector('#send-radar').checked,downloadFolder:document.querySelector('#download-folder').value.trim(),portalUrl:document.querySelector('#portal-url').value.trim(),portalToken:document.querySelector('#portal-token').value.trim()}}
async function saveSettings(silent=false){const settings=readSettings();if(settings.sendRadar&&(!settings.portalUrl||!settings.portalToken)){if(!silent)showStatus('Informe o endpoint e a chave do Radar.',true);return null}await chrome.storage.local.set(settings);if(!silent)showStatus('Parâmetros salvos neste navegador.');return settings}
async function loadSettings(){const settings=await chrome.storage.local.get(DEFAULTS);stackOptions.querySelectorAll('input').forEach(input=>input.checked=settings.selectedStacks.includes(input.value));document.querySelector('#custom-terms').value=settings.customTerms;document.querySelector('#download-files').checked=settings.downloadFiles;document.querySelector('#send-radar').checked=settings.sendRadar;document.querySelector('#download-folder').value=settings.downloadFolder;document.querySelector('#portal-url').value=settings.portalUrl;document.querySelector('#portal-token').value=settings.portalToken}

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
document.querySelector('#save-settings').addEventListener('click',()=>saveSettings());
document.querySelector('#start').addEventListener('click',async()=>{
  const typedUrl=searchInput.value.trim();
  const url=typedUrl||openSearches.value;
  if(!url){showStatus('Abra uma pesquisa do LinkedIn e atualize a lista.',true);return}
  if(!url.startsWith('https://www.linkedin.com/jobs/search/')){showStatus('Informe um link válido da busca de vagas do LinkedIn.',true);return}
  const settings=await saveSettings(true);if(!settings){showStatus('Informe o endpoint e a chave do Radar.',true);return}
  if(!settings.downloadFiles&&!settings.sendRadar){showStatus('Selecione ao menos um destino: Downloads ou Radar.',true);return}
  const selected=openSearches.selectedOptions[0];
  const message={type:'START_AUTOMATIC_COLLECTION',url,source:typedUrl?'link informado':selected?.textContent,tabId:typedUrl?null:Number(selected?.dataset.tabId)||null,settings};
  showStatus('Iniciando a coleta de todas as páginas…');
  chrome.runtime.sendMessage(message,response=>{
    if(chrome.runtime.lastError||!response?.ok){showStatus(response?.error||'Não foi possível iniciar a coleta.',true);return}
    showStatus(`Coleta iniciada usando: ${response.source}. Acompanhe a aba do LinkedIn.`);
  });
});

loadSettings();
listSearches();
