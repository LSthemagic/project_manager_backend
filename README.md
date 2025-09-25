# Project Manager - API

API RESTful completa para um Sistema de Gerenciamento de Projetos, desenvolvida com Node.js, Fastify e PostgreSQL. Este projeto foi criado para atender aos requisitos das disciplinas de Programação Web e Banco de Dados II.

## ✨ Funcionalidades

-   **Autenticação e Sessão**: Sistema completo de login, registro e gerenciamento de sessão com cookies.
-   **Controle de Acesso por Papel (RBAC)**: Três níveis de usuário (`admin`, `gerente`, `comum`) com permissões distintas.
-   **Gerenciamento de Projetos**: CRUD completo para projetos, com lógica de acesso que impede usuários de verem projetos que não lhes pertencem.
-   **Gerenciamento de Tarefas**: CRUD completo para tarefas, aninhadas dentro de projetos.
-   **Colaboração**: Funcionalidades de comentários, sub-tarefas e apontamento de horas (`Time Logs`).
-   **Upload de Arquivos**: Envio de anexos para tarefas, com suporte a redimensionamento de imagens.
-   **Recursos Avançados de Banco de Dados**:
    -   Uso de **JSONB** para dados semi-estruturados (`preferencias`, `configuracoes`).
    -   Busca **Full-Text Search** em tarefas.
    -   **Views** para relatórios gerenciais complexos.
    -   **Functions** para regras de negócio (cálculo de progresso, finalização de projeto).
    -   **Triggers** para auditoria automática de alterações.
-   **Relatórios e Auditoria**: Endpoints protegidos para administradores visualizarem relatórios e logs de auditoria.
-   **Testes Automatizados**: Suíte de testes com Jest e Supertest para garantir a qualidade e segurança da API.

## 🚀 Tecnologias Utilizadas

-   **Backend**: Node.js
-   **Framework**: Fastify
-   **Banco de Dados**: PostgreSQL
-   **Autenticação**: `@fastify/cookie` + `@fastify/session`
-   **Uploads**: `@fastify/multipart`
-   **Manipulação de Imagens**: `sharp`
-   **Envio de E-mail**: `Nodemailer`
-   **Testes**: Jest, Supertest

## ⚙️ Instalação e Configuração

### Pré-requisitos

-   Node.js (v18 ou superior)
-   npm
-   PostgreSQL

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd project_manager_backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados:**
    -   Garanta que seu servidor PostgreSQL esteja rodando.
    -   Execute o script `script_postgresql.sql` para criar o banco, as tabelas e popular os dados iniciais.

4.  **Configure as Variáveis de Ambiente:**
    -   Crie um arquivo `.env` na raiz do projeto.
    -   Preencha as variáveis, especialmente `DATABASE_URL` e `SESSION_SECRET`.

## ▶️ Executando a Aplicação

-   **Modo de Desenvolvimento:**
    ```bash
    npm run dev
    ```
-   **A API estará disponível em:**
    ```bash
    (https://project-manager-backend-5wv2.onrender.com/)
    ```
-   **O postman estará disponível em:**
    ```bash
    https://warped-robot-985060.postman.co/workspace/My-Workspace~46808a60-3796-4320-8263-57e1b7c6a1d7/collection/32370891-ebdecf35-1c6f-4c42-a312-500b272ea133?action=share&source=copy-link&creator=32370891
    ```

## ✅ Executando os Testes



```bash
npm test
