window.addEventListener('codex:start-linkedin-collection',event=>{
  chrome.runtime.sendMessage({type:'START_AUTOMATIC_COLLECTION',url:event.detail?.url,source:event.detail?.source,tabId:event.detail?.tabId},response=>{
    const detail=chrome.runtime.lastError
      ? {ok:false,error:'A extensão precisa ser recarregada.'}
      : (response||{ok:false,error:'A extensão não respondeu.'});
    window.dispatchEvent(new CustomEvent('codex:linkedin-collection-response',{detail}));
  });
});
window.addEventListener('codex:list-linkedin-searches',()=>{
  chrome.runtime.sendMessage({type:'LIST_LINKEDIN_SEARCHES'},response=>{
    const detail=chrome.runtime.lastError?{ok:false,searches:[]}:(response||{ok:false,searches:[]});
    window.dispatchEvent(new CustomEvent('codex:linkedin-searches-response',{detail}));
  });
});
window.dispatchEvent(new CustomEvent('codex:linkedin-extension-ready'));
