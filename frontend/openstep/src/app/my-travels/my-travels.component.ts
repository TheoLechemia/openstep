import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../api.service';
import { CreateTravelDialogComponent } from '../create-travel-dialog/create-travel-dialog.component';
import { StepDialogService } from '../step-dialog.service';

@Component({
  selector: 'app-my-travels',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './my-travels.component.html',
  styleUrl: './my-travels.component.scss',
})
export class MyTravelsComponent implements OnInit {
  travels: any[] = [];
  loading = true;

  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);
  private _stepDialog = inject(StepDialogService);

  constructor(private _api: ApiService, private _router: Router) {}

  ngOnInit(): void {
    this.loadTravels();
  }

  loadTravels(): void {
    this.loading = true;
    this._api.getMyTravels().subscribe({
      next: (travels) => {
        this.travels = travels;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openCreateTravel(): void {
    const ref = this._dialog.open(CreateTravelDialogComponent, { width: '560px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(travel => {
      if (travel) {
        this.travels.unshift(travel);
        this._router.navigate(['/travel', travel.uuid]);
      }
    });
  }

  copyShareLink(travel: any): void {
    const url = `${window.location.origin}${window.location.pathname}#/travel/${travel.uuid}`;
    navigator.clipboard.writeText(url).then(() => {
      this._snackbar.open('Lien copié !', undefined, { duration: 2000 });
    });
  }

  goToTravel(uuid: string): void {
    this._router.navigate(['/travel', uuid]);
  }

  openAddStep(travel: any): void {
    this._stepDialog.openAddStep(travel).subscribe(() => {
      this.loadTravels();
    });
  }
}
