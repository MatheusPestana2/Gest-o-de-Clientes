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