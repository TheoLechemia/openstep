import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private _http: HttpClient, private _config: ConfigService) {}

  /** Call once after config is loaded to restore session from localStorage. */
  init(): Observable<any> {
    if (this.token) {
      return this._http
        .get<AuthUser>(`${this._config.config.API_ENDPOINT}/auth/me/`)
        .pipe(
          tap(user => this._user$.next(user)),
          catchError(() => {
            localStorage.removeItem('auth_token');
            return of(null);
          })
        );
    }
    return of(null);
  }

  get user$(): Observable<AuthUser | null> {
    return this._user$.asObservable();
  }

  get user(): AuthUser | null {
    return this._user$.getValue();
  }

  get token(): string | null {
    return localStorage.getItem('auth_token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(username: string, password: string): Observable<any> {
    return this._http
      .post<{ token: string; user: AuthUser }>(
        `${this._config.config.API_ENDPOINT}/auth/login/`,
        { username, password }
      )
      .pipe(
        tap(resp => {
          localStorage.setItem('auth_token', resp.token);
          this._user$.next(resp.user);
        })
      );
  }

  logout(): Observable<any> {
    return this._http
      .post(`${this._config.config.API_ENDPOINT}/auth/logout/`, {})
      .pipe(
        tap(() => {
          localStorage.removeItem('auth_token');
          this._user$.next(null);
        }),
        catchError(() => {
          localStorage.removeItem('auth_token');
          this._user$.next(null);
          return of(null);
        })
      );
  }
}
