import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');

test('catálogo oferece stacks selecionáveis',async()=>{const source=await read('../extensao-linkedin/stacks.js'),context={};vm.createContext(context);vm.runInContext(source,context);assert.ok(context.STACK_CATALOG.length>=25);for(const id of ['java','javascript','python','aws','azure','docker','kubernetes','salesforce'])assert.ok(context.STACK_CATALOG.some(stack=>stack.id===id))});

test('filtro mantém somente vagas compatíveis e anota stacks',async()=>{const stackSource=await read('../extensao-linkedin/stacks.js'),background=await read('../extensao-linkedin/background.js'),noop={addListener(){},removeListener(){}},context={chrome:{tabs:{onActivated:noop,onUpdated:noop},runtime:{onMessage:noop}},importScripts(){}};vm.createContext(context);vm.runInContext(stackSource,context);vm.runInContext(background,context);const jobs=[{titulo:'Backend Java',descricao:'Spring Boot e AWS',link:'1'},{titulo:'Designer',descricao:'Figma',link:'2'}],filtered=context.applyStackFilter(jobs,{selectedStacks:['java'],customTerms:''});assert.equal(filtered.length,1);assert.deepEqual([...filtered[0].stack],['Java','Spring','AWS'])});

test('painel salva filtros e destinos no Chrome',async()=>{const [html,script]=await Promise.all([read('../extensao-linkedin/dashboard.html'),read('../extensao-linkedin/dashboard.js')]);assert.match(html,/id="stack-options"/);assert.match(html,/id="download-folder"/);assert.match(html,/id="send-radar"/);assert.match(script,/chrome\.storage\.local\.set/);assert.match(script,/selectedStacks/);assert.match(script,/portalToken/)});

test('service worker filtra, baixa e envia ao Radar',async()=>{const source=await read('../extensao-linkedin/background.js');assert.match(source,/applyStackFilter/);assert.match(source,/chrome\.downloads\.download/);assert.match(source,/authorization.*Bearer/);assert.match(source,/sendToRadar/)});

test('manifest limita integração externa ao Radar conhecido',async()=>{const manifest=JSON.parse(await read('../extensao-linkedin/manifest.json'));assert.equal(manifest.version,'2.1.0');assert.ok(manifest.permissions.includes('storage'));assert.ok(manifest.permissions.includes('downloads'));assert.deepEqual(manifest.host_permissions,['https://www.linkedin.com/*','https://radar-carreira-almir-v2.prof-andreiamr.chatgpt.site/*'])});
