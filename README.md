# Meu Projeto

Sistema completo de cadastro de pessoas com frontend em React/Next.js, backend em Flask e banco de dados PostgreSQL no Supabase.

## 🚀 Funcionalidades

- ✅ Cadastro de pessoas com nome, email, idade e cidade
- ✅ Listagem em tempo real dos cadastros
- ✅ Interface responsiva e moderna
- ✅ Validação de dados no frontend e backend
- ✅ Conexão segura com banco de dados Supabase
- ✅ Deploy automatizado na Vercel

## 🛠 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca de interface
- **Next.js** - Framework React
- **Styled Components** - Estilização
- **Vercel** - Hospedagem

### Backend
- **Python** - Linguagem de programação
- **Flask** - Framework web
- **PostgreSQL** - Banco de dados
- **Supabase** - Plataforma de banco de dados
- **psycopg2** - Driver PostgreSQL para Python

## 📋 Pré-requisitos

- Node.js 16+ 
- Python 3.8+
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com)

## 🚀 Como Executar Localmente

### 1. Clone o repositório
```js
git clone <url_do_repositorio>
cd meu-projeto
```

### 2. Configure o Backend

```py
# Entre na pasta do backend
cd api

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

### 3. Configure o Frontend
```py
# Volte para a raiz e entre na pasta do frontend
cd ../frontend

# Instale as dependências
npm install
```
### 4. Execute a Aplicação
#### Terminal 1 - Backend:

```py
cd api
python app.py
```
Backend rodando em: http://localhost:5000

#### Terminal 2 - Frontend:

```py
cd frontend
npm run dev
```
Frontend rodando em: http://localhost:3000

### ⚙️ Configuração das Variáveis de Ambiente
Crie um arquivo ``.env`` na pasta ``api/`` com:

```py
DB_HOST=seu_host_supabase
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_PORT=5432
```
⚠️ Importante: O arquivo ``.env`` não deve ser commitado no Git por questões de segurança.

### 🗂 Estrutura do Projeto

```py
meu-projeto/
├── api/
│   ├── app.py              # Backend Flask
│   ├── requirements.txt    # Dependências Python
│   └── .env               # Variáveis de ambiente (não commitado)
├── frontend/
│   ├── pages/
│   │   └── index.js       # Página principal
│   ├── package.json       # Dependências Node.js
│   └── next.config.js     # Configuração Next.js
├── vercel.json            # Configuração Vercel
└── README.md
```
## 🌐 Deploy na Vercel
### 1. Prepare o Projeto

```py
# Na raiz do projeto
vercel login
vercel --prod
```
### 2. Configure as Environment Variables na Vercel
No painel da Vercel, adicione:

```py
DB_HOST

DB_NAME

DB_USER

DB_PASSWORD

DB_PORT
```

### 3. Acesse seu Site
Seu site estará disponível em: https://meu-projeto.vercel.app

### 📊 API Endpoints
Método - Endpoint - Descrição
GET - ``/api/pessoas`` - Lista todas as pessoas
POST - ``/api/pessoas`` - Cadastra nova pessoa
GET - ``/api/pessoas/{id}`` - Busca pessoa por ID
GET - ``/api/test-db`` - Testa conexão com banco

### 🗃️ Configuração do Banco de Dados
#### Criar Tabela no Supabase
Execute no SQL Editor do Supabase:

```sql
CREATE TABLE pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    idade INTEGER,
    cidade VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Inserir Dados de Exemplo
```sql
INSERT INTO pessoas (nome, email, idade, cidade) VALUES 
('Ana Silva', 'ana@email.com', 25, 'São Paulo'),
('Carlos Oliveira', 'carlos@email.com', 32, 'Rio de Janeiro'),
('Mariana Santos', 'mariana@email.com', 28, 'Belo Horizonte');
```

## 🔧 Comandos Úteis
### Desenvolvimento

```py
# Backend
cd api && python app.py

# Frontend  
cd frontend && npm run dev

# Ambos (usando Vercel)
vercel dev
```

### Deploy

```py
# Deploy na Vercel
vercel --prod

# Ver variáveis de ambiente
vercel env ls
```

### 🐛 Solução de Problemas
#### Erro de CORS
- Verifique se o Flask-CORS está instalado

- Confirme se CORS(app) está no app.py

#### Erro de Conexão com Banco
- Verifique as credentials no ``.env``

- Confirme se o Supabase está ativo

- Teste com ``/api/test-db``

#### Frontend não Conecta
- Confirme se o backend está rodando na porta 5000

- Verifique a URL da API no frontend

#### Erro 404 no Deploy
- Verifique se as environment variables estão configuradas na Vercel

- Confirme o vercel.json está correto

#### 🔒 Segurança
- SSL obrigatório para conexão com Supabase

- Variáveis de ambiente protegidas

- CORS configurado corretamente

- Validação de dados no backend

### 🚀 Próximas Melhorias
- Edição de registros

- Exclusão de pessoas

- Pesquisa e filtros

- Paginação

- Upload de fotos

- Autenticação de usuários

- Dashboard com estatísticas

### 📝 Licença
Este projeto é open source e está disponível sob a MIT License.

### 👥 Contribuição
Contribuições são sempre bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

#### Desenvolvido com ❤️ usando Flask, React e Supabase

#### Para dúvidas ou suporte, abra uma issue no repositório do projeto.