import { Component, OnInit, Input, inject } from '@angular/core';
import {  DatePipe } from '@angular/common';

import { MapComponent } from '../map/map.component';
import { ApiService } from '../api.service';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { StepDetailComponent } from '../step-detail/step-detail.component';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [MapComponent, MatIcon, MatCardModule, MatButtonModule, MatDividerModule, DatePipe],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.scss'
})
export class TravelDetailComponent implements OnInit {
  constructor(private _api: ApiService) {}
  readonly dialog = inject(MatDialog);

  public stepsList:any = [];
  public stepsGeoJson:any = [];
  public travel: any = {}
  @Input()
  set id(idTravel: number) {
    this._api.getTravel(idTravel).subscribe(travel => {
      this.travel = travel;
      const steps = travel.steps;
      travel.steps.features.forEach((step: any) => {
        this._api.getNominatimInfo(step.geometry.coordinates[1], step.geometry.coordinates[0]).subscribe(data => {
          if("address" in data) {
            step.properties.country = data.address.country;
            step.properties.state = data.address.state;
          }
          step.properties.dayOfStep = this.calculateDayOfStep(step.properties.date)
          this.stepsList.push(step)
        })
      });
      this.stepsGeoJson = steps
    });
  }


  calculateDayOfStep(stepDate) {
    const travelStart = new Date(this.travel.start_date);
    const stepDateD = new Date(stepDate);

    let differenceInTime = stepDateD.getTime() - travelStart.getTime();
    return Math.round(differenceInTime / (1000 * 3600 * 24));


  }


  ngOnInit(): void {
    
  }

  openDialog(step): void {
    this.dialog.open(StepDetailComponent, {
      width: "80%",
      data: {
        travel: this.travel,
        step: step,
      },
    }

    );
  }

  right() {

  }

  left() {
    
  }

}
