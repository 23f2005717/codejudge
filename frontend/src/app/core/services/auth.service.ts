import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export type UserRole = 'student' | 'instructor';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  login(
    credentials: LoginRequest,
    rememberMe: boolean
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.authUrl}/login`,
        credentials
      )
      .pipe(
        tap(response => {
          this.saveSession(
            response.access_token,
            response.user,
            rememberMe
          );
        })
      );
  }

  register(
    data: RegisterRequest
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.authUrl}/register`,
      data
    );
  }

  logout(): void {
    localStorage.removeItem('codejudge_token');
    localStorage.removeItem('codejudge_user');

    sessionStorage.removeItem('codejudge_token');
    sessionStorage.removeItem('codejudge_user');
  }

  getToken(): string | null {
    return (
      localStorage.getItem('codejudge_token') ??
      sessionStorage.getItem('codejudge_token')
    );
  }

  getUser(): User | null {
    const storedUser =
      localStorage.getItem('codejudge_user') ??
      sessionStorage.getItem('codejudge_user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      this.logout();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.getUser()?.role === role;
  }

  private saveSession(
    token: string,
    user: User,
    rememberMe: boolean
  ): void {
    this.logout();

    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    storage.setItem('codejudge_token', token);
    storage.setItem(
      'codejudge_user',
      JSON.stringify(user)
    );
  }
}