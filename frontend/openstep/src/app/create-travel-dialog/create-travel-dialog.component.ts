import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-create-travel-dialog',
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
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './create-travel-dialog.component.html',
  styleUrl: './create-travel-dialog.component.scss',
})
export class CreateTravelDialogComponent {
  name = '';
  description = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  isPublic = true;
  photo: File | null = null;
  photoPreview: string | null = null;
  loading = false;
  error = '';

  constructor(private _api: ApiService, private _dialogRef: MatDialogRef<CreateTravelDialogComponent>) {}

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.photo = input.files[0];
      const reader = new FileReader();
      reader.onload = e => (this.photoPreview = e.target?.result as string);
      reader.readAsDataURL(this.photo);
    }
  }

  submit(): void {
    if (!this.name || !this.startDate || !this.photo) {
      this.error = 'Name, start date and media are mandatory.';
      return;
    }
    this.loading = true;
    this.error = '';
    const fd = new FormData();
    fd.append('name', this.name);
    fd.append('description', this.description);
    fd.append('start_date', this.formatDate(this.startDate));
    if (this.endDate) fd.append('end_date', this.formatDate(this.endDate));
    fd.append('is_public', String(this.isPublic));
    fd.append('main_photo', this.photo);

    this._api.createTravel(fd).subscribe({
      next: (travel) => {
        this.loading = false;
        this._dialogRef.close(travel);
      },
      error: (err) => {
        this.loading = false;
        this.error = JSON.stringify(err.error) || 'Erreur lors de la création.';
      },
    });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
