import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateUser, UpdateUser, User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  findAll(active?: boolean): Observable<User[]> {
    let params = new HttpParams();

    if (active !== undefined) {
      params = params.set('active', String(active));
    }

    return this.http.get<User[]>(this.apiUrl, { params });
  }

  findOne(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: CreateUser): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: number, user: UpdateUser): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
  }

  inactivate(id: number, active: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, { active });
  }
}
