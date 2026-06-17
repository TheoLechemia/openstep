import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CreateStepDialogComponent } from './create-step-dialog/create-step-dialog.component';
import { ApiService } from './api.service';
import { TravelService } from './travel.service';

@Injectable({ providedIn: 'root' })
export class StepDialogService {
  private _dialog = inject(MatDialog);
  private _api = inject(ApiService);
  private _travelService = inject(TravelService);

  /**
   * Opens the create-step dialog for the given travel.
   * Reloads the travel in TravelService on success.
   * Returns an Observable that emits the refreshed travel, or EMPTY if cancelled.
   */
  openAddStep(travel: { id: number; uuid: string }): Observable<any> {
    const ref = this._dialog.open(CreateStepDialogComponent, {
      width: '860px',
      maxWidth: '95vw',
      data: { travelId: travel.id, travelUuid: travel.uuid },
    });

    return ref.afterClosed().pipe(
      switchMap(created => {
        if (!created) return EMPTY;
        return this._api.getTravel(travel.uuid);
      }),
    );
  }
}
