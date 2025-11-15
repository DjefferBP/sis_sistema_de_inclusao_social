# SIS – Sistema de Inclusão Social

## 📌 Visão Geral

O **SIS – Sistema de Inclusão Social** é uma aplicação full-stack voltada para o gerenciamento de usuários e dados relacionados à inclusão social. O sistema apresenta:

- **Back-End:** Construído com FastAPI (Python 3), integrando PostgreSQL, autenticação JWT e criptografia de senhas com bcrypt.
- **Front-End:** Desenvolvido em React e TypeScript, com Axios para a comunicação com a API.
- **Banco de Dados:** PostgreSQL, modelando usuários com segurança de informações.

O objetivo do SIS é ser simples, seguro e eficiente no cadastro, consulta e administração de usuários.

---

## 🗂 Arquitetura do Projeto

A aplicação segue um padrão Cliente-Servidor dividido em três camadas principais:

```
Frontend (React + TypeScript)
        ↓ HTTP/JSON
Backend API (FastAPI + Uvicorn)
        ↓ SQLAlchemy
Banco de Dados (PostgreSQL)
```
Toda comunicação é feita via JSON protegida por autenticação JWT.

---

## 🛠 Tecnologias Utilizadas

- **Backend:** FastAPI, Python 3, Uvicorn, SQLAlchemy, PyJWT, bcrypt, Pydantic
- **Banco de Dados:** PostgreSQL 15+
- **Frontend:** React, TypeScript, Vite, Axios, React Router

---

## 🗃 Estrutura de Pastas

### Backend (`backend/`)
- `app/` — (códigos e módulos da aplicação)
- `scripts/` — scripts auxiliares/scripts de banco
- `requirements.txt` — dependências Python
- `venv/` — ambiente virtual Python

### Frontend (`frontend/`)
- `.env*` — variáveis de ambiente
- `public/` — arquivos públicos do frontend
- `src/`
  - `main.tsx` — ponto de entrada React
  - `App.tsx` — root do app
  - `pages/` — páginas principais (`Login`, `Dashboard`, `Usuarios`)
  - `components/` — componentes reutilizáveis (`FormUsuario`)
  - `services/api.ts` — configuração do Axios para acesso à API
- Configurações: `package.json`, `vite.config.ts`, `tsconfig.json` etc.

---

## 🗄 Banco de Dados

Tabela principal: **usuarios**

| Campo       | Tipo         | Descrição                     |
|-------------|--------------|-------------------------------|
| id          | serial       | PK                            |
| nome        | varchar(120) | Nome do usuário               |
| email       | varchar(120) | Email único                   |
| senha_hash  | text         | Senha criptografada (bcrypt)  |
| criado_em   | timestamp    | Data de criação               |

---

## 🔒 Segurança

- Todas as senhas são protegidas por hash bcrypt.
- Autenticação baseada em JWT, incluindo subject (id do usuário) e expiração.
- Todas as rotas protegidas requerem o header Authorization: Bearer <token>.

---

## 📑 Funcionalidades

- **Autenticação**
  - `POST /auth/login`: Geração de token JWT
  - `POST /auth/verify`: Verificação de token e dados do usuário

- **Usuários**
  - `POST /usuarios/`: Cadastrar novo usuário
  - `GET /usuarios/`: Listar todos os usuários
  - `GET /usuarios/{id}`: Buscar usuário por ID
  - `PUT /usuarios/{id}`: Atualizar nome/email de usuário
  - `DELETE /usuarios/{id}`: Remover usuário

- **Testes**
  - Integração: Acesso ao banco, CRUD de usuários, autenticação
  - E2E: Fluxo de login e cadastro de usuário pelo front

---

## 🖥️ Front-End

Principais páginas:

- **Login** — autenticação do usuário e armazenamento do JWT
- **Dashboard** — visão geral do sistema
- **Gestão de Usuários** — listagem/cadastro/edição/remoção

A integração com a API é realizada via `Axios`, incluindo o token JWT nos headers das requisições autenticadas.

---

## 🚀 Como Executar o Projeto

### Backend
```bash
cd backend
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Build de Produção

### Front-End
```bash
npm run build
```

### Back-End
- Configure variáveis de ambiente
- Utilize `supervisor` ou `systemd` para manter ativo
- Configure um reverse proxy (ex: Nginx)

---

## 📝 Manual de Uso

1. Acesse a tela de login
2. Digite suas credenciais
3. Vá para a Dashboard
4. Na aba "Usuários", cadastre ou visualize dados
5. Edite ou exclua conforme a necessidade

---

## 📍 Conclusão

O SIS é um sistema modular, seguro e moderno, desenvolvido para ser simples de usar, de manter e escalar.