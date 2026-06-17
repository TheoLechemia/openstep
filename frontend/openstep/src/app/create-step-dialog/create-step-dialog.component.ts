import {
  Component, Inject, AfterViewInit, OnDestroy, ViewChild, ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import * as L from 'leaflet';
import { ApiService } from '../api.service';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-create-step-dialog',
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
    MatChipsModule,
  ],
  templateUrl: './create-step-dialog.component.html',
  styleUrl: './create-step-dialog.component.scss',
})
export class CreateStepDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('locationMap', { static: true }) mapContainer!: ElementRef;

  name = '';
  date: Date | null = null;
  description = '';
  positionalStep = false;
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  mediaFiles: File[] = [];
  mediaPreviews: { url: string; isVideo: boolean }[] = [];
  mediaLegends: string[] = [];
  loading = false;
  error = '';

  private _map!: L.Map;
  private _marker: L.Marker | null = null;

  constructor(
    private _api: ApiService,
    private _dialogRef: MatDialogRef<CreateStepDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { travelId: number; travelUuid: string }
  ) {}

  ngAfterViewInit(): void {
    this._map = L.map(this.mapContainer.nativeElement).setView([20, 0], 2);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 12,
    }).addTo(this._map);

    this._map.on('click', (e: L.LeafletMouseEvent) => {
      this.selectedLat = e.latlng.lat;
      this.selectedLng = e.latlng.lng;
      if (this._marker) {
        this._marker.setLatLng(e.latlng);
      } else {
        this._marker = L.marker(e.latlng, { draggable: true }).addTo(this._map);
        this._marker.on('dragend', (ev: any) => {
          const pos = ev.target.getLatLng();
          this.selectedLat = pos.lat;
          this.selectedLng = pos.lng;
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this._map) {
      this._map.remove();
    }
  }

  onMediaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(file => {
      this.mediaFiles.push(file);
      this.mediaLegends.push('');
      const isVideo = file.type.startsWith('video/');
      if (isVideo) {
        this.mediaPreviews.push({ url: URL.createObjectURL(file), isVideo: true });
      } else {
        const reader = new FileReader();
        reader.onload = e => this.mediaPreviews.push({ url: e.target?.result as string, isVideo: false });
        reader.readAsDataURL(file);
      }
    });
    // Reset input so the same file can be re-added
    input.value = '';
  }

  removeMedia(index: number): void {
    this.mediaFiles.splice(index, 1);
    this.mediaPreviews.splice(index, 1);
    this.mediaLegends.splice(index, 1);
  }

  submit(): void {
    if (!this.name) { this.error = 'Le nom est obligatoire.'; return; }
    if (!this.date) { this.error = 'La date est obligatoire.'; return; }
    if (this.selectedLat === null || this.selectedLng === null) {
      this.error = 'Cliquez sur la carte pour sélectionner l\'emplacement.';
      return;
    }
    this.loading = true;
    this.error = '';

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.selectedLng, this.selectedLat],
      },
      properties: {
        name: this.name,
        date: this.date.toISOString().split('T')[0] + 'T12:00:00',
        description: this.description,
        travel: this.data.travelId,
        positional_step: this.positionalStep,
      },
    };

    this._api.createStep(geojson).subscribe({
      next: (step) => {
        const stepId = step.id;
        if (this.mediaFiles.length === 0) {
          this.loading = false;
          this._dialogRef.close(true);
          return;
        }
        // Upload medias sequentially
        from(this.mediaFiles).pipe(
          concatMap((file, index) => {
            const fd = new FormData();
            const isVideo = file.type.startsWith('video/');
            fd.append(isVideo ? 'video_file' : 'image_file', file);
            if (this.mediaLegends[index]) fd.append('legend', this.mediaLegends[index]);
            return this._api.addMediaToStep(stepId, fd);
          })
        ).subscribe({
          complete: () => {
            this.loading = false;
            this._dialogRef.close(true);
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Étape créée, mais une erreur est survenue lors de l\'upload des médias.';
          },
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = JSON.stringify(err.error) || 'Erreur lors de la création.';
      },
    });
  }
}
