export interface Categoria {
  _id: string;
  nome: string;
}

export interface Supermercado {
  _id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  horario: string;
  metodoEntrega: string;
  custoEntrega: number;
}

export interface Produto {
  _id: string;
  nome: string;
  descricao: string;
  preco: number;
  stock: number;
  imagem?: string;
  categoria: Categoria;
  supermercado: Supermercado;
}

export interface CartItem {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  supermercadoId: string;
  supermercadoNome: string;
}

export interface EncomendaItem {
  id: string;
  quantidade: number;
}

export interface Encomenda {
  _id: string;
  total: number;
  tipoEntrega: string;
  metodoEntrega: string;
  custoEntrega: number;
  estadoEntrega: string;
  cliente: {
    nome?: string;
    email?: string;
  };
  supermercado: Supermercado;
  produtos: Array<{
    produto: Produto;
    quantidade: number;
  }>;
  createdAt: string;
}
