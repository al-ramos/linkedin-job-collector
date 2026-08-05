# Coletor automático de vagas do LinkedIn

## Instalação única no Chrome

1. Abra `chrome://extensions`.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta `extensao-linkedin` deste projeto.
5. Fixe a extensão **Coletor de Vagas do LinkedIn** na barra do Chrome.

## Uso pela página

1. Inicie a página com `python -m http.server 8000` nesta pasta.
2. Abra `http://localhost:8000`.
3. Cole o link da busca do LinkedIn com os filtros desejados ou deixe vazio para usar a busca que já estiver aberta.
4. Clique em **Iniciar coleta automática**.
5. A busca será aberta; a rotina lerá o total de resultados e calculará todas as páginas automaticamente.
6. Aguarde o painel azul indicar a conclusão.

A rotina percorre todas as páginas calculadas, também para quando deixa de encontrar vagas novas, elimina links repetidos e gera um único CSV/JSON consolidado.

O coletor baixa CSV e JSON automaticamente. Ele usa somente a sessão autenticada e não contorna login, CAPTCHA ou limitações do LinkedIn.

`index.html` e `linkedin-coletor.js` foram mantidos como alternativa manual.
