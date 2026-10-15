# O livro que esperava por você

Um pequeno jogo romântico de exploração, pensado para celular, feito com HTML, CSS e JavaScript puro.

## Como testar
1. Extraia os arquivos.
2. Abra `index.html` no navegador. Para melhor compatibilidade, use uma hospedagem estática ou uma extensão de servidor local.
3. Toque em **Entrar na biblioteca**.
4. Use as setas na tela para mover a personagem e **Examinar** perto de estantes e do livro.
5. Ao encontrar o livro, a página final será exibida.

## Como personalizar
Abra `index.html` e procure:
- `Para você, meu amor`: título provisório da capa.
- `escrito com carinho`: nome/assinatura.
- A dedicatória, dentro de `<div class="dedication">`.

Edite `style.css` para mudar cores e aparência.

## Como adicionar seu PDF
1. Coloque o PDF final na mesma pasta de `index.html`.
2. Renomeie-o para **`livro.pdf`**.
3. O botão **Abrir meu presente** já aponta para `livro.pdf`.

Se o arquivo tiver outro nome, mude `href="livro.pdf"` no botão com id `pdf-button` em `index.html`.

## Publicar grátis no GitHub Pages
1. Crie um repositório público no GitHub.
2. Envie `index.html`, `style.css`, `script.js` e `livro.pdf` (quando estiver pronto).
3. No repositório, abra **Settings → Pages**.
4. Em *Build and deployment*, escolha **Deploy from a branch**, selecione `main` e `/ (root)`, e salve.
5. Aguarde a publicação e abra o endereço que o GitHub Pages mostrar.

**Privacidade:** um repositório público torna o PDF acessível a qualquer pessoa que tenha o link. Se quiser que o presente seja mais privado, considere compartilhar o PDF por um serviço com acesso restrito e atualizar o link do botão.
