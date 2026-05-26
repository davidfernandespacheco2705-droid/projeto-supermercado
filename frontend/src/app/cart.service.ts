import { Injectable } from '@angular/core';
import { CartItem, Produto } from './models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];

  addProduto(produto: Produto, quantidade: number): boolean {
    if (quantidade <= 0) {
      return false;
    }

    if (this.items.length > 0 && this.items[0].supermercadoId !== produto.supermercado._id) {
      return false;
    }

    const existente = this.items.find(item => item.produtoId === produto._id);
    if (existente) {
      existente.quantidade += quantidade;
      return true;
    }

    this.items.push({
      produtoId: produto._id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade,
      supermercadoId: produto.supermercado._id,
      supermercadoNome: produto.supermercado.nome
    });

    return true;
  }

  removeProduto(produtoId: string): void {
    this.items = this.items.filter(item => item.produtoId !== produtoId);
  }

  getItems(): CartItem[] {
    return this.items;
  }

  clear(): void {
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  }

  getSupermercadoId(): string | null {
    return this.items.length > 0 ? this.items[0].supermercadoId : null;
  }

  getSupermercadoNome(): string {
    return this.items.length > 0 ? this.items[0].supermercadoNome : '';
  }
}
