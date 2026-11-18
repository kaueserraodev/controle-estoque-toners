# 🖨️ Controle de Estoque de Toners — NASP / Central de Cópias

Sistema web desenvolvido para gerenciar o estoque de toners HP da Central de Cópias (NASP), permitindo o controle sincronizado em tempo real entre diferentes computadores, visualização rápida por armário e exportação de relatórios.

---

## 📌 Sobre o Projeto

O **Controle de Estoque de Toners** foi criado para facilitar a rotina operacional da Central de Cópias, centralizando a contagem por armário, código de identificação e cor, além de manter os dados sincronizados na nuvem para acesso simultâneo da equipe.

### Principais funcionalidades:
- **Cadastro, edição e exclusão** de toners com sincronização em nuvem.
- **Preenchimento automático** da linha de toners, cor e armário ao selecionar o código de identificação (`W2150XC`, `W2151XC`, `W2152XC`, `W2153XC`).
- **Painel de resumo** com contagem total de códigos, unidades disponíveis e saldo individual por armário (Armários 1 a 4).
- **Busca e filtros dinâmicos** por código, número de série, modelo, armário ou cor.
- **Exportação para Excel (`.csv`)** com um clique para backup e relatórios.
- **Tema Claro e Escuro** com alternância rápida e preferência salva no navegador.

---

## 🛠️ Como foi feito

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

- **Front-end:** `HTML5`, `CSS3` e `JavaScript (ES6+)`
- **Biblioteca / SDK:** `@supabase/supabase-js` (via CDN)
- **Banco de Dados:** `Supabase` (`PostgreSQL` na nuvem)
- **Hospedagem:** `GitHub Pages`

---

## 🚀 Como usar

1. **Acesso online (GitHub Pages):**
   Basta abrir o link publicado no GitHub Pages em qualquer computador ou dispositivo conectado à internet para visualizar e atualizar o estoque compartilhado.

2. **Executar localmente:**
   Clone o repositório e abra o arquivo `index.html` no navegador:
   ```bash
   git clone [https://kaueserraodev.github.io/controle-estoque-toners/](https://kaueserraodev.github.io/controle-estoque-toners/)

   --



   
