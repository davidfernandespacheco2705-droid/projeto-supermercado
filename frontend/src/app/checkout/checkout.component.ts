import { Component } from '@angular/core';
import { CartService } from '../cart.service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  clienteNome = '';
  clienteEmail = '';
  mensagem = '';
  sucesso = false;
  carregando = false;

  constructor(public cart: CartService, private api: ApiService) {}

  enviarPedido(): void {
    if (!this.clienteNome || !this.clienteEmail) {
      this.mensagem = 'Preencha o nome e email do cliente.';
      return;
    }

    const items = this.cart.getItems();
    if (items.length === 0) {
      this.mensagem = 'O carrinho está vazio.';
      return;
    }

    const pedido = {
      cliente_nome: this.clienteNome,
      cliente_email: this.clienteEmail,
      supermercadoId: this.cart.getSupermercadoId(),
      tipoEntrega: 'domicilio',
      produtos: items.map(item => ({ id: item.produtoId, quantidade: item.quantidade }))
    };

    this.carregando = true;
    this.api.createOrder(pedido).subscribe({
      next: () => {
        this.sucesso = true;
        this.mensagem = 'Encomenda registada com sucesso!';
        this.cart.clear();
        this.carregando = false;
      },
      error: err => {
        this.mensagem = err.error?.error || 'Erro ao registar a encomenda.';
        this.sucesso = false;
        this.carregando = false;
      }
    });
  }
}
