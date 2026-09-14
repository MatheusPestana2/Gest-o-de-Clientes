# 🚀 Sistema de Gestão e Cadastro de Clientes

Uma aplicação Full Stack desenvolvida em React, TypeScript, Node.js e SQL Server para gerenciamento e cadastro de clientes com filtragem avançada, validações dinâmicas e arquitetura modular.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
* **React** (com TypeScript)
* **Tailwind CSS** (Estilização)
* **Lucide React / Heroicons** (Ícones da interface)

### **Backend**
* **Node.js** com **Express**
* **TypeScript**
* **MSSQL / Tedious** (Conexão com banco SQL Server)

---

## 📂 Estrutura do Projeto

```text
Projeto/
 ├── backend/                   # Servidor API em Node.js com TypeScript
 │    ├── src/
 │    │    ├── config/
 │    │    │    └── db.ts       # Conexão e configuração do banco SQL Server
 │    │    ├── controllers/     # Gerenciamento de requisições e respostas HTTP
 │    │    │    ├── authController.ts     # Login e autenticação
 │    │    │    ├── clienteController.ts  # CRUD de clientes
 │    │    │    └── usuarioController.ts  # Gestão de usuários
 │    │    ├── repositories/    # Execução direta de consultas e queries SQL
 │    │    │    ├── clienteRepository.ts  # Queries da tabela de clientes
 │    │    │    └── usuarioRepository.ts  # Queries da tabela de usuários
 │    │    ├── routes/          # Mapeamento de endpoints e rotas da API
 │    │    │    ├── clienteRoute.ts       # Rotas de clientes (/clientes)
 │    │    │    └── usuarioRoute.ts       # Rotas de usuários e auth (/usuarios)
 │    │    ├── services/        # Regras de negócio e validações do servidor
 │    │    │    └── clienteService.ts     # Lógica de negócio do cliente
 │    │    ├── types/           # Tipagens e interfaces do TypeScript
 │    │    │    └── cliente.ts            # Interface de dados do Cliente
 │    │    └── server.ts        # Ponto de entrada (sobe o servidor Express)
 │    ├── .env                  # Variáveis de ambiente e credenciais
 │    ├── .gitignore            # Arquivos ignorados pelo Git no backend
 │    ├── package-lock.json     # Trava de versões exatas das dependências
 │    ├── package.json          # Dependências e scripts do Node.js
 │    └── tsconfig.json         # Configurações do compilador TypeScript
 │
 └── frontend/                  # Aplicação Web em React com TypeScript
      ├── public/               # Arquivos estáticos (HTML principal, favicon, ícones)
      └── src/
           ├── components/      # Componentes reutilizáveis e visuais
           │    ├── clientes/   # Subcomponentes do módulo de clientes
           │    │    ├── ClienteFiltros.tsx      # Barra de busca e filtros
           │    │    ├── ClienteModalForm.tsx    # Modal de criação/edição
           │    │    ├── ClienteModalPerfil.tsx  # Modal de detalhes do perfil
           │    │    └── ClienteTabela.tsx       # Tabela de listagem
           │    ├── Clientes.tsx                 # View integrada do módulo de clientes
           │    ├── LoadingScreen.tsx            # Tela de carregamento (spinner)
           │    └── PrivateRoute.tsx             # Proteção de rotas autenticadas
           ├── constants/       # Opções e dados estáticos
           │    └── opcoesAreasCargos.ts         # Listas estáticas para dropdowns
           ├── hooks/           # Custom Hooks para regra de interface
           │    └── useClientes.ts               # Hook de estado e requisições de clientes
           ├── pages/           # Páginas principais da aplicação
           ├── services/        # Consumo de API via HTTP (Fetch/Axios)
           │    ├── authService.ts               # Requisições de autenticação
           │    └── clienteService.ts            # Requisições de clientes
           ├── utils/           # Funções utilitárias e ajudantes
           │    └── formats.ts                   # Máscaras (CPF, telefone) e formatação
           ├── App.css          # Estilos específicos do componente App
           ├── App.test.tsx     # Testes do componente principal
           ├── App.tsx          # Componente raiz e definição de rotas
           ├── index.css        # Estilos globais e diretivas do Tailwind
           ├── index.tsx        # Ponto de entrada do React (renderiza na DOM)
           ├── react-app-env.d.ts # Tipagens globais do Create React App
           ├── reportWebVitals.ts # Métricas de performance do React
           ├── setupTests.ts    # Configuração do ambiente de testes frontend
           └── .gitignore       # Arquivos ignorados pelo Git no frontend


           ## 📋 Pré-requisitos e Instalação

### 1. Ferramentas Necessárias
Antes de rodar a aplicação, certifique-se de ter instalado em sua máquina:
* **Node.js** (Versão 18 ou superior) — [Baixar Node.js](https://nodejs.org/)
* **Git** — [Baixar Git](https://git-scm.com/)
* **SQL Server** e **SSMS** (ou instância ativa do banco de dados) — [Baixar SSMS](https://learn.microsoft.com/pt-br/sql/ssms/download-sql-server-management-studio-ssms)

---

### 2. Passo a Passo para Baixar e Rodar

. **Clonar o Repositório:**
   git clone https://github.com/MatheusPestana2/Gest-o-de-Clientes.git
   cd Gest-o-de-Clientes


### 3. Crie o arquivo.env dentro da pasta backend/
 DB_USER=usuario_app
DB_PASSWORD=123456
DB_SERVER=localhost
DB_NAME=ProjetoComercial
DB_PORT=1433

### 4. Instalar Dependências e Executar o Backend:
cd backend
npm install
npm run dev

### 5. Instalar Dependências e Executar o Frontend (em outro terminal):
cd frontend
npm install
npm start

🧪 Como Testar a Aplicação
Siga este roteiro para demonstrar e testar o sistema:

Autenticação e Rota Protegida:

Acesse http://localhost:3000.

Insira um usuário e senha válidos para validar o middleware de rota protegida (PrivateRoute).

Listagem e Detalhes:

Navegue até a tela de Clientes.

Observe a renderização da tabela com nome, documento formatado, e-mail e cargo.

Clique em um cliente para abrir o modal com os dados detalhados (ClienteModalPerfil).

Filtragem Dinâmica:

Digite um nome na barra de busca.

Selecione um valor no filtro por Área ou Cargo para testar a busca combinada em tempo real.

Novo Cadastro e Edição:

Clique em Novo Cliente para abrir o modal (ClienteModalForm).

Preencha os campos de CPF/CNPJ e Telefone para testar a aplicação automática de máscaras.

Salve os dados e veja a tabela atualizar dinamicamente.

Exclusão de Registros:

Teste a remoção de um cliente da lista enviando a requisição DELETE para o servidor.