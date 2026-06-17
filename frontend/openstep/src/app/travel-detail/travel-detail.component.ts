import { Component, Input, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { MapComponent } from '../map/map.component';
import { ApiService } from '../api.service';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import 'leaflet-polylinedecorator';
import { Router } from '@angular/router';
import { MapService } from '../map.service';
import { TravelService } from '../travel.service';
import { AuthService } from '../auth.service';
import { StepDialogService } from '../step-dialog.service';
import { filter } from 'rxjs';


@Component({
  selector: 'app-travel-detaisl',
  standalone: true,
  imports: [CommonModule, MapComponent, MatIcon, MatCardModule, MatButtonModule, MatDividerModule, DatePipe],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.scss',
  providers: [MapService],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class TravelDetailComponent implements AfterViewInit {
  constructor(private _api: ApiService, private _router : Router, public mapService: MapService, 
    private travelService : TravelService, public auth: AuthService,
    private _stepDialog: StepDialogService) {}
  @ViewChild('slider') slider: ElementRef;
  public travel: any = {}
  public nonPositionelSteps = []
  public steps: Array<any>;

  @Input()
  set uuid(uuidTravel: string) {
    // load travel and store it in travel service
    // it avoid loading it on each initinialization
    if (uuidTravel != this.travelService.currentTravelUuid) {
      this._api.getTravel(uuidTravel).subscribe(travel => {
        this.travelService.setTravel(travel)
      });
    }
  }

  get isOwner(): boolean {
    const user = this.auth.user;
    if (!user || !this.travel?.owners) return false;
    return this.travel.owners.includes(user.id);
  }

  ngAfterViewInit (): void {
    this.travelService.travel$.pipe(
      filter(travel => travel != null)
    ).subscribe(travel => {
      this.nonPositionelSteps = [];
      this.steps = travel.steps.features;
      travel.steps.features.forEach((step: any, index) => {
        if(!step.properties.positional_step) {
          this.nonPositionelSteps.push(step);
        }
        step.properties.isLastStep = index == travel.steps.features.length -1
      });
      this.mapService.displayTravelLine(travel.steps)
      this.travel = travel;

      const swiperEl = document.querySelector('swiper-container');
      const swiperParams = {
        gridRow: 1,
        mousewheel: true,
        slidesPerView: 1.5,
        initialSlide: this.travel.steps.features.length,
        breakpoints: {
          640: {
            slidesPerView: 2.5
          },
          1024: {
            slidesPerView: 5.5,
          },
        },
        on: {
          init() {
            // ...
          },
        },
      };
  
      Object.assign(swiperEl, swiperParams);
  
      // and now initialize it
      swiperEl.initialize();
    })
  }

  openAddStep(): void {
    this._stepDialog.openAddStep(this.travel).subscribe(travel => {
      this.travelService.setTravel(travel);
    });
  }

  goToDetail(idStep) {
    this._router.navigate(["travel", this.travel.uuid, "step", idStep])
  }

  generatePopup(feature) {    
    const hasMedias = feature.properties.medias.length > 0;    
    let firstMedia = null;
    let stepDay =  new Date(feature.properties.date);
    let now = new Date();
    let differenceInTime = now.getTime() - stepDay.getTime();
    let diffenreceInDay = Math.round(differenceInTime / (1000 * 3600 * 24));
    if(hasMedias) {      
      firstMedia = feature.properties.first_image?.thumb;
    }    
    return `
          <div class="img-container" style="background-image: url(${firstMedia});">
            <div class="overlay">
              <div class="info-overlay"> 
                <h4> ${feature.properties.name} </h4>
                <p> ${feature.properties.date} - ${diffenreceInDay} days ago </p>

              </div>
              <div class="button-see-step">
              <a href="./#/travel/${this.travel.uuid}/step/${feature.id}" >
              <button class="mdc-button mdc-button--unelevated mat-mdc-unelevated-button mat-unthemed mat-mdc-button-base" > See this step</button>
              </a>
              </div>
            </div>
    `
  }

  pointToLayer(feature, latLng) {    
    const marker = this.mapService.pointToLayer(feature, latLng);
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
