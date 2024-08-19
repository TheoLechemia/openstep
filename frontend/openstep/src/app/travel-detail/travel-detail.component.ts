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
import * as L from "leaflet"
import 'leaflet-polylinedecorator';


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

  public travel: any = {}
  @Input()
  set id(idTravel: number) {
    this._api.getTravel(idTravel).subscribe(travel => {
      const steps = travel.steps;
      travel.steps.features.forEach((step: any, index) => {
        step.properties.dayOfStep = this.calculateDayOfStep(step.properties.date);
        step.properties.isLastStep = index == travel.steps.features.length -1
        this._api.getNominatimInfo(step.geometry.coordinates[1], step.geometry.coordinates[0]).subscribe(data => {
          if("address" in data) {
            step.properties.country = data.address.country;
            step.properties.state = data.address.state;
          }
          
        })
      });
      this.travel = travel;
      
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

  generatePopup(feature) {
    const hasMedias = feature.properties.medias.length > 0;    
    let firstMedia = null;
    let stepDay =  new Date(feature.properties.date);
    let now = new Date();
    console.log(stepDay);
    let differenceInTime = now.getTime() - stepDay.getTime();
    let diffenreceInDay = Math.round(differenceInTime / (1000 * 3600 * 24));
    if(hasMedias) {
      firstMedia = feature.properties.medias[0].media_file
    }    
    return `
          <div class="img-container" style="background-image: url(${firstMedia});">
            <div class="overlay">
              <h4> ${feature.properties.name} </h4>
              <p> ${feature.properties.date} - ${diffenreceInDay} days ago </p>
              <div class="button-see-step">
                <button class="mdc-button mdc-button--unelevated mat-mdc-unelevated-button mat-unthemed mat-mdc-button-base" > See this step</button>
              </div>
            </div>
    
    `
  }

  pointToLayer(feature, latLng) {
    console.log("LAAA", feature.properties.isLastStep );
    
    let icon = L.divIcon({
      html:`<div class="observation-marker-container ${feature.properties.isLastStep ? "last-step": ""}">

          </div>
        </div>`,
      className: 'observation-marker',
      iconSize: 32,
      iconAnchor: [18, 28],
    } as any);
    const marker = L.marker(latLng, {icon: icon});
    marker.bindPopup(this.generatePopup(feature));
    marker.on('mouseover', function (e) {
        this.openPopup();
    });
    return marker;
  }

  right() {

  }

  left() {
    
  }

}
