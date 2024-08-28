import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { InfodialogComponent } from './infodialog/infodialog.component';

import {
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService } from './config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, MatButtonModule, RouterOutlet, MatToolbarModule, MatIconModule, InfodialogComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public appName = "";
  constructor(private _appConfig: ConfigService){
    this.appName =  this._appConfig.config.APP_NAME;
  }
  readonly dialog = inject(MatDialog);

  openDialog(): void {
    this.dialog.open(InfodialogComponent, {
    });
  }

}
