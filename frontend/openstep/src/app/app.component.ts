import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { InfodialogComponent } from './infodialog/infodialog.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

import {
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule, MatButtonModule, RouterOutlet, MatToolbarModule, MatIconModule, MatMenuModule, InfodialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  public appName = "";
  constructor(private _appConfig: ConfigService, public auth: AuthService, private _router: Router){
    this.appName =  this._appConfig.config.APP_NAME;
  }
  readonly dialog = inject(MatDialog);

  ngOnInit(): void {}

  openDialog(): void {
    this.dialog.open(InfodialogComponent, {});
  }

  openLogin(): void {
    this.dialog.open(LoginDialogComponent, { width: '380px' });
  }

  logout(): void {
    this.auth.logout().subscribe(() => this._router.navigate(['/']));
  }
}

