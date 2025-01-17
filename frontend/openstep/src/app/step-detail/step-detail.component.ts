import { Component, Input, inject, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ContentChild, ElementRef, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MatIcon } from '@angular/material/icon';
import {  DatePipe } from '@angular/common';
import * as L from "leaflet" 

import {
  MatDialog,
} from '@angular/material/dialog';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ApiService } from '../api.service';
import { MapComponent } from '../map/map.component';
import { MapService } from '../map.service';
import { MatDivider } from '@angular/material/divider';
import { RouterLink} from '@angular/router';
import {MatFormFieldModule, MatSuffix} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { TravelService } from '../travel.service';
import { filter } from 'rxjs';
import { SwiperContainer } from 'swiper/element';
import { Swiper } from 'swiper/types';


@Component({
  selector: 'app-step-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, MatSuffix, MatInputModule,MatListModule, MatFormFieldModule, MapComponent, MatDivider, CarouselModule, MatButtonModule, DatePipe,  MatIcon],
  templateUrl: './step-detail.component.html',
  styleUrl: './step-detail.component.scss',
  providers: [MapService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class StepDetailComponent implements AfterViewInit  {
  constructor(private _api: ApiService,private _mapService: MapService,  public travelService: TravelService) {}
  public step:any;
  public steps = [];
  public idStep_: number;
  readonly dialog = inject(MatDialog);


  public commentMessage: string;
  @Input()
  set idTravel(idTravel: number) {
    if (!this.travelService.travel) {
      this._api.getTravel(idTravel).subscribe(travel => {
        this.travelService.setTravel(travel);
      });
    }  
  }
  @Input()
  set idStep(idStep: string) {
    this.idStep_ = parseInt(idStep);

    // this._api.getStep(idStep).subscribe(step => this.step = step);
  }
  // @ContentChild('swiper') swiperRef!: ElementRef<SwiperContainer>;

  @ViewChild('swiperRef')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;


  ngAfterViewInit(): void {
    
    this.travelService.travel$.pipe(
      filter(travel => travel != null)
    ).subscribe(travel => {
      this.steps = travel.steps.features;                  
      this._mapService.displayTravelLine(travel.steps);      
      // TODO : improve this : must wait for the geosjon to be loaded
      setTimeout(() => {
        this._mapService.zoomOnLayer(this.idStep_, 9)
      }, 1000);

      let swippperStartIndex = travel.steps.features.map(step => step.id).indexOf(this.idStep_) | 0;
      const swiperEl = document.querySelector('swiper-container');
      const swiperParams = {
        slidesPerView: 1,
        // direction : "vertical",
        pagination: true,
        initialSlide: swippperStartIndex,
      };
  
      Object.assign(swiperEl, swiperParams);
  
      // and now initialize it
      swiperEl.initialize();
      this.swiper = this.swiperRef?.nativeElement.swiper;
      var t = document.getElementById("lala"); t
      swiperEl.addEventListener('swiperslidechange', (event) => {
        // pas moyen d'avoir le "activeSlide" via l'API et sans timeout on 
        // retrouve la slide d'avant...
        setTimeout(() => {
          // on doit remetre la 
          swiperEl.style.height = "auto"
          const activeSlide = document.getElementsByClassName("swiper-slide-active")[0];
          console.log(activeSlide);
          
          const currentHeight = (activeSlide as HTMLElement).offsetHeight;
          console.log(currentHeight);
          
          // très moche
          swiperEl.style.height =  currentHeight.toString()+"px";
        }, 200);

        this._mapService.zoomOnLayer(this.steps[this.swiper.activeIndex].id);
      });
      
    })
  }

  findStepFromIndex(index) {
    this.steps.find
  }

  addComment(){    
    this._api.postComment({
      "step": this.step.id,
      "message": this.commentMessage
    }).subscribe(comment => {
      this.commentMessage = "";
      this.step.properties.comments.push(comment)
    })
  }

}
