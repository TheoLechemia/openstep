import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Connexion</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nom d'utilisateur</mat-label>
        <input matInput [(ngModel)]="username" (keyup.enter)="login()" autocomplete="username">
        <mat-icon matSuffix>person</mat-icon>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Mot de passe</mat-label>
        <input matInput type="password" [(ngModel)]="password" (keyup.enter)="login()" autocomplete="current-password">
        <mat-icon matSuffix>lock</mat-icon>
      </mat-form-field>
      @if (error) {
        <p class="error-msg">{{ error }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button [disabled]="loading" (click)="login()">
        @if (loading) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Se connecter
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; min-width: 300px; }
    .error-msg { color: var(--mat-form-field-error-text-color, red); font-size: 0.85rem; margin: 0; }
  `],
})
export class LoginDialogComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private _auth: AuthService, private _dialogRef: MatDialogRef<LoginDialogComponent>) {}

  login(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this._auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this._dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Identifiants incorrects';
      },
    });
  }
}
