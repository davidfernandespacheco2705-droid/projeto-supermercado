# Projeto Marketplace de Supermercados

Este projeto é uma solução simples de Milestone 2 com:

- Backend Express + MongoDB
- API REST pública para supermercados, categorias, produtos e encomendas
- Documentação Swagger disponível em `/api-docs`
- Frontoffice Angular simples para pesquisa, carrinho, checkout e histórico de encomendas

## Como executar

### 1. Arrancar o backend

No diretório principal do projeto:

```bash
npm install
npm run start:backend
```

O servidor de backend vai correr em `http://localhost:3000`.

### 2. Arrancar o frontend Angular

No diretório `frontend`:

```bash
cd frontend
npm install
npm start
```

O frontend vai correr em `http://localhost:4200`.

### 3. Usar a aplicação

- Aceder ao frontend: `http://localhost:4200`
- Use o menu para pesquisar produtos, adicionar ao carrinho e finalizar encomendas
- Consultar o histórico: `http://localhost:4200/pedidos`
- Aceder à documentação API: `http://localhost:3000/api-docs`

## Variáveis de ambiente

Se quiser alterar a ligação à base de dados MongoDB, defina:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/supermarketDB
```

## Nota

Os dados de exemplo (supermercados, categorias e produtos) não estão incluídos e devem ser criados manualmente ou carregados separadamente.
