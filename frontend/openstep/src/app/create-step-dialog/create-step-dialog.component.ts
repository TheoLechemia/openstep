import {
  Component, Inject, AfterViewInit, OnDestroy, ViewChild, ElementRef, OnInit,
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
export class CreateStepDialogComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('locationMap', { static: true }) mapContainer!: ElementRef;

  name = '';
  date: Date | null = null;
  description = '';
  positionalStep = false;
  published = true;
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  mediaFiles: File[] = [];
  mediaPreviews: { url: string; isVideo: boolean }[] = [];
  mediaLegends: string[] = [];
  // medias that already exist on the server when editing a step
  existingMedias: { id: number; url: string; isVideo: boolean; legend: string }[] = [];
  // ids of existing medias that were removed in the UI (note: backend deletion
  // endpoint is not implemented in the API, so these are tracked client-side)
  removedExistingMediaIds: number[] = [];
  loading = false;
  error = '';
  geoLocating = false;

  private _map!: L.Map;
  private _marker: L.Marker | null = null;

  isEdit = false;

  constructor(
    private _api: ApiService,
    private _dialogRef: MatDialogRef<CreateStepDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.step) {
      const s = this.data.step;
      this.isEdit = true;
      this.name = s.properties.name || '';
      this.description = s.properties.description || '';
      this.positionalStep = !!s.properties.positional_step;
      this.published = s.properties.published !== undefined ? !!s.properties.published : true;
      // geometry: [lng, lat]
      if (s.geometry && s.geometry.coordinates) {
        this.selectedLng = s.geometry.coordinates[0];
        this.selectedLat = s.geometry.coordinates[1];
      }
      this.date = s.properties.date ? new Date(s.properties.date) : null;
      // Load existing medias into previews/legends so they appear in the editor
      if (s.properties && Array.isArray(s.properties.medias)) {
        s.properties.medias.forEach((m: any) => {
          const isVideo = m.media_type === 'video';
          this.existingMedias.push({ id: m.id, url: m.src, isVideo, legend: m.caption || '' });
          this.mediaPreviews.push({ url: m.src, isVideo });
          this.mediaLegends.push(m.caption || '');
        });
      }
    }
  }

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

    // If editing and we have coordinates, add marker and center map
    if (this.isEdit && this.selectedLat !== null && this.selectedLng !== null) {
      const latlng = L.latLng(this.selectedLat, this.selectedLng);
      this._map.setView(latlng, 8);
      this._marker = L.marker(latlng, { draggable: true }).addTo(this._map);
      this._marker.on('dragend', (ev: any) => {
        const pos = ev.target.getLatLng();
        this.selectedLat = pos.lat;
        this.selectedLng = pos.lng;
      });
    }
  }

  setMarkerAt(lat: number, lng: number) {
    const latlng = L.latLng(lat, lng);
    this._map.setView(latlng, 12);
    this.selectedLat = lat;
    this.selectedLng = lng;
    if (this._marker) {
      this._marker.setLatLng(latlng);
    } else {
      this._marker = L.marker(latlng, { draggable: true }).addTo(this._map);
      this._marker.on('dragend', (ev: any) => {
        const pos = ev.target.getLatLng();
        this.selectedLat = pos.lat;
        this.selectedLng = pos.lng;
      });
    }
  }

  useMyLocation(): void {
    this.error = '';
    this.geoLocating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.setMarkerAt(lat, lng);
        this.geoLocating = false;
      },
      (err) => {
        this.geoLocating = false;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            this.error = 'Autorisation de géolocalisation refusée.'; break;
          case err.POSITION_UNAVAILABLE:
            this.error = 'Position non disponible.'; break;
          case err.TIMEOUT:
            this.error = 'Délai de géolocalisation dépassé.'; break;
          default:
            this.error = 'Erreur lors de la géolocalisation.';
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
    // If the removed item is one of the existing medias, track its id for
    // potential deletion and remove it from the existing list.
    if (index < this.existingMedias.length) {
      const removed = this.existingMedias.splice(index, 1)[0];
      if (removed && removed.id) this.removedExistingMediaIds.push(removed.id);
    } else {
      // Adjust index relative to new uploads
      const newIndex = index - this.existingMedias.length;
      this.mediaFiles.splice(newIndex, 1);
    }
    // Remove preview/legend entry in all cases (they are aligned)
    this.mediaPreviews.splice(index, 1);
    this.mediaLegends.splice(index, 1);
  }

  submit(): void {
    if (!this.name) { this.error = 'Name is mandatory.'; return; }
    if (!this.date) { this.error = 'Date is mandatory.'; return; }
    if (this.selectedLat === null || this.selectedLng === null) {
      this.error = 'Click on the map to point the step !';
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
        published: this.published,
        travel: this.data.travelId,
        positional_step: this.positionalStep,
      },
    };
    if (this.isEdit && this.data?.step) {
      // Update existing step
      
      this._api.updateStep(this.data.step.id, geojson).subscribe({
        next: (step) => {
          const stepId = step.id;
          if (this.mediaFiles.length === 0) {
            if (this.removedExistingMediaIds.length === 0) {
              this.loading = false;
              this._dialogRef.close(true);
              return;
            }
            // delete removed existing medias sequentially
            from(this.removedExistingMediaIds).pipe(
              concatMap(id => this._api.deleteMedia(id))
            ).subscribe({
              complete: () => { this.loading = false; this._dialogRef.close(true); },
              error: (err) => { this.loading = false; this.error = 'Étape mise à jour, mais une erreur est survenue lors de la suppression des médias.'; }
            });
            return;
          }
          from(this.mediaFiles).pipe(
            concatMap((file, index) => {
              const fd = new FormData();
              const isVideo = file.type.startsWith('video/');
              fd.append(isVideo ? 'video_file' : 'image_file', file);
              const legendIndex = this.existingMedias.length + index;
              if (this.mediaLegends[legendIndex]) fd.append('legend', this.mediaLegends[legendIndex]);
              return this._api.addMediaToStep(stepId, fd);
            })
          ).subscribe({
            complete: () => {
              // after uploading new medias, delete any removed existing ones
              if (this.removedExistingMediaIds.length === 0) {
                this.loading = false;
                this._dialogRef.close(true);
                return;
              }
              from(this.removedExistingMediaIds).pipe(
                concatMap(id => this._api.deleteMedia(id))
              ).subscribe({
                complete: () => { this.loading = false; this._dialogRef.close(true); },
                error: (err) => { this.loading = false; this.error = 'Étape mise à jour, mais une erreur est survenue lors de la suppression des médias.'; }
              });
            },
            error: (err) => {
              this.loading = false;
              this.error = 'Étape mise à jour, mais une erreur est survenue lors de l\'upload des médias.';
            },
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = JSON.stringify(err.error) || 'Erreur lors de la mise à jour.';
        },
      });
    } else {
      // Create new step
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
              const legendIndex = this.existingMedias.length + index;
              if (this.mediaLegends[legendIndex]) fd.append('legend', this.mediaLegends[legendIndex]);
              return this._api.addMediaToStep(stepId, fd);
            })
          ).subscribe({
            complete: () => {
              // No existing medias to delete for a freshly created step, but keep the
              // same flow in case something changed: delete removed ids then close.
              if (this.removedExistingMediaIds.length === 0) {
                this.loading = false;
                this._dialogRef.close(true);
                return;
              }
              from(this.removedExistingMediaIds).pipe(
                concatMap(id => this._api.deleteMedia(id))
              ).subscribe({
                complete: () => { this.loading = false; this._dialogRef.close(true); },
                error: (err) => { this.loading = false; this.error = 'Étape créée, mais une erreur est survenue lors de la suppression des médias.'; }
              });
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
}
