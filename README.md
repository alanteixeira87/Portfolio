# Portfólio — Alan Teixeira

Site estático em HTML, CSS e JavaScript, publicável diretamente no GitHub Pages. A home está em `index.html`, o produto real implementado na operação está em `qa-automation-suite.html` e o estudo de caso está em `paketa.html`.

## Adicionar um projeto

Identifique primeiro se o material representa um produto implementado, um estudo de caso ou um experimento. Crie uma página HTML própria, declare essa natureza com clareza na abertura e nos metadados, adicione o link à seção de projetos da home e mantenha caminhos relativos para que a publicação em subdiretórios do GitHub Pages continue funcionando.

## Imagens de interface e anatomia

Armazene as imagens em `IMG/assets`. A convenção preferencial é:

```text
Modulo.png
Modulo - anatomia da solução.png
```

Exemplo:

```text
Gerador de payload.png
Gerador de payload - anatomia da solução.png
```

No componente `.image-explorer`, informe os caminhos nos atributos `data-clean` e `data-anatomy`. O JavaScript testa a existência da imagem de anatomia: se ela não carregar, o botão de alternância fica oculto e a interface continua funcional. PNG, JPG/JPEG, WebP e AVIF funcionam porque a lógica usa a URL completa, sem depender da extensão.

Os arquivos recebidos neste projeto usam o sufixo legado ` - anatomia do projeto`; eles foram preservados e configurados explicitamente para não alterar os originais. Para novas duplas, use ` - anatomia da solução`.

## Conteúdo e manutenção

Os pontos editoriais ficam no HTML dentro de `.decision-groups`; a quantidade exibida deve corresponder às anotações reais. Não publique métricas, dados pessoais ou regras que não estejam comprovados na documentação operacional. O PDF operacional não faz parte da versão pública.

## Testes

Instale as dependências com `npm install`, instale o navegador uma vez com `npx playwright install chromium` e execute `npm test`. A suíte inicia um servidor local e valida páginas, console, interações, fallback e viewports de 320 a 1920 px.
