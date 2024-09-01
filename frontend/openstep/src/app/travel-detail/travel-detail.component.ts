import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import {  DatePipe } from '@angular/common';

import { MapComponent } from '../map/map.component';
import { ApiService } from '../api.service';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import 'leaflet-polylinedecorator';
import { Router } from '@angular/router';
import { MapService } from '../map.service';


@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [MapComponent, MatIcon, MatCardModule, MatButtonModule, MatDividerModule, DatePipe],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.scss',
  providers: [MapService]
})
export class TravelDetailComponent {
  constructor(private _api: ApiService, private _router : Router, private _mapService: MapService) {}
  @ViewChild('slider') slider: ElementRef;
  public travel: any = {}
  @Input()
  set id(idTravel: number) {
    this._api.getTravel(idTravel).subscribe(travel => {
      const steps = travel.steps;
      travel.steps.features.forEach((step: any, index) => {
        step.properties.isLastStep = index == travel.steps.features.length -1
      });
      this._mapService.displayTravelLine(travel.steps)
      this.travel = travel;
      
      setTimeout(() => {
        this.slider.nativeElement.scrollBy({
          left : this.slider.nativeElement.scrollWidth,
          behavior: 'smooth',
          
        })
      }, 500);
    });
  }


  zoomOnLayer(idStep) {
    for(let key in this._mapService.layers) {
      const currentLayer: L.Marker = this._mapService.layers[key];
      const regularIcon = this._mapService.getIcon(currentLayer.feature, false);
      currentLayer.setIcon(regularIcon);
    }
    const layer = this._mapService.layers[idStep];
    const selectedIcon = this._mapService.getIcon(layer.feature, true)
    layer.setIcon(selectedIcon);
    
    if(layer) {
      this._mapService.map.setView(layer.getLatLng(), 12)
    }
    
  }

  goToDetail(idStep) {    
    this._router.navigate(["step", idStep])
  }

  generatePopup(feature) {
    const hasMedias = feature.properties.medias.length > 0;    
    let firstMedia = null;
    let stepDay =  new Date(feature.properties.date);
    let now = new Date();
    let differenceInTime = now.getTime() - stepDay.getTime();
    let diffenreceInDay = Math.round(differenceInTime / (1000 * 3600 * 24));
    if(hasMedias) {
      firstMedia = feature.properties.medias[0].media_file
    }    
    return `
          <div class="img-container" style="background-image: url(${firstMedia});">
            <div class="overlay">
              <div class="info-overlay"> 
                <h4> ${feature.properties.name} </h4>
                <p> ${feature.properties.date} - ${diffenreceInDay} days ago </p>

              </div>
              <div class="button-see-step">
              <a href="./#/step/${feature.id}" > 
              <button class="mdc-button mdc-button--unelevated mat-mdc-unelevated-button mat-unthemed mat-mdc-button-base" > See this step</button>
              </a>
              </div>
            </div>
    `
  }

  pointToLayer(feature, latLng) {    
    const marker = this._mapService.pointToLayer(feature, latLng);
    marker.bindPopup(this.generatePopup(feature));
    marker.on('click', function (e) {
        this.openPopup();
    });
    return marker;
  }


  moove(pixel:number) {
    this.slider.nativeElement.scrollBy({
      left: pixel,
      behavior: 'smooth',
    });
  }

}
