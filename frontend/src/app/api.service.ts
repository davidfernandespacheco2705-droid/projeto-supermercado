import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria, Encomenda, Produto, Supermercado } from './models';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getSupermercados(): Observable<Supermercado[]> {
    return this.http.get<Supermercado[]>(`${API_URL}/supermercados`);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${API_URL}/categorias`);
  }

  getProdutos(pesquisa = '', categoria = '', supermercadoId = ''): Observable<Produto[]> {
    let params = new HttpParams();
    if (pesquisa) {
      params = params.set('pesquisa', pesquisa);
    }
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    if (supermercadoId) {
      params = params.set('supermercadoId', supermercadoId);
    }
    return this.http.get<Produto[]>(`${API_URL}/produtos`, { params });
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post(`${API_URL}/encomendas`, payload);
  }

  getOrders(email: string): Observable<Encomenda[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Encomenda[]>(`${API_URL}/encomendas`, { params });
  }
}
