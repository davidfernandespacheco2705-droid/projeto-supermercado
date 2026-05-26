import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Encomenda } from '../models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  email = '';
  encomendas: Encomenda[] = [];
  mensagem = '';

  constructor(private api: ApiService) {}

  buscar(): void {
    if (!this.email) {
      this.mensagem = 'Insira um email para visualizar as encomendas.';
      return;
    }

    this.api.getOrders(this.email).subscribe({
      next: orders => {
        this.encomendas = orders;
        this.mensagem = this.encomendas.length === 0 ? 'Nenhuma encomenda encontrada.' : '';
      },
      error: () => {
        this.mensagem = 'Erro ao buscar encomendas.';
      }
    });
  }
}
