import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { CartService } from '../cart.service';
import { Categoria, Produto, Supermercado } from '../models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  supermercados: Supermercado[] = [];
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  pesquisa = '';
  categoriaId = '';
  supermercadoId = '';
  mensagem = '';

  constructor(private api: ApiService, private cart: CartService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.api.getSupermercados().subscribe(supermercados => {
      this.supermercados = supermercados;
      this.pesquisar();
    });

    this.api.getCategorias().subscribe(categorias => {
      this.categorias = categorias;
    });
  }

  pesquisar(): void {
    this.api.getProdutos(this.pesquisa, this.categoriaId, this.supermercadoId).subscribe(result => {
      this.produtos = result;
      this.mensagem = this.produtos.length === 0 ? 'Nenhum produto encontrado com estes filtros.' : '';
    });
  }

  adicionarCarrinho(produto: Produto): void {
    const ok = this.cart.addProduto(produto, 1);
    if (!ok) {
      this.mensagem = 'Só é possível encomendar produtos de um supermercado por encomenda.';
      return;
    }
    this.mensagem = `${produto.nome} adicionado ao carrinho.`;
  }

  get itemsCount(): number {
    return this.cart.getItems().reduce((sum, item) => sum + item.quantidade, 0);
  }

  get cartTotal(): number {
    return this.cart.getTotal();
  }
}
