import { Component, Input, inject, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ContentChild, ElementRef, ViewChildren, QueryList, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MatIcon } from '@angular/material/icon';
import {  CommonModule, DatePipe } from '@angular/common';
import * as L from "leaflet" 
import { LightboxModule } from 'ngx-lightbox';
import { Lightbox } from 'ngx-lightbox';


import {
  MatDialog,
} from '@angular/material/dialog';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ApiService } from '../api.service';
import { MapComponent } from '../map/map.component';
import { MapService } from '../map.service';
import { MatDivider } from '@angular/material/divider';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatFormFieldModule, MatSuffix} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { TravelService } from '../travel.service';
import { filter } from 'rxjs';
import { SwiperContainer } from 'swiper/element';
import { Swiper } from 'swiper/types';
import interact from 'interactjs'



@Component({
  selector: 'app-step-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, MatSuffix, MatInputModule,MatListModule, MatFormFieldModule, MapComponent, MatDivider, CarouselModule, LightboxModule, MatButtonModule, DatePipe,  MatIcon, CommonModule],
  templateUrl: './step-detail.component.html',
  styleUrl: './step-detail.component.scss',
  providers: [MapService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class StepDetailComponent implements AfterViewInit  {
  constructor(private _api: ApiService, private _router: Router,   private _route: ActivatedRoute, private _lightbox: Lightbox, private _mapService: MapService,  public travelService: TravelService, private _cd: ChangeDetectorRef) {}
  public steps: Array<any> = [];
  public step: any;
  public idStep_: number;
  public idTravel: number;
  readonly dialog = inject(MatDialog);
  public commentMessage: string;
  public stepIndexInTravel: number;
  @ViewChild('swiperRef')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  ngAfterViewInit(): void {

    // interact('#rotate-area').gesturable({
    //   onmove: function (event) {
    //     var arrow = document.getElementById('arrow')
    
    //     angle += event.da
    
    //     arrow.style.webkitTransform =
    //     arrow.style.transform =
    //       'rotate(' + angle + 'deg)'
    
    //     document.getElementById('angle-info').textContent =
    //       angle.toFixed(2) + '\u00b0'
    //   },
    // })
    // const position = { x: 0, y: 0 }

    // let angle = 0
    // interact('#main').draggable({
    //     startAxis: 'x',
    //     lockAxis: 'x',
    //   listeners: {
    //     start (event) {
    //       // console.log(event.type, event.target)
    //     },
    //     move (event) {
    //       console.log("mooove", event);
          
    //       position.x += event.dx
    //       position.y += event.dy
    
    //       // event.target.style.transform =
    //       //   `translate(${position.x}px, ${position.y}px)`
    //     },

    //     end(event) {
    //       console.log("end", event);
          
    //     }
    //   }
    // })


    addEventListener("touchstart", (event) => {

      console.log(event);
      
    });

    // addEventListener("touchmove", (event) => {

    //   console.log(event);
      
    // });

    addEventListener("touchend", (event) => {

      console.log("enddd", event);
      console.log(event.changedTouches[0].pageX);
      
      
    });


    // document.addEventListener('swiped', (e:any) => {
      
    //   if(e.detail.dir == 'right') {
    //     const swipe = document.getElementById("left-swipper");
    //     swipe.style.display = "block"
    //     setTimeout(() => {
    //       this.previousStep();
    //     }, 200);
    //   }
    //   if(e.detail.dir == "left") {
    //     this.nextStep();
    //   }
    // });

    this._route.params.subscribe(route => {
        const swipe = document.getElementById("left-swipper");
        swipe.style.display = "none"
      this.idTravel = parseInt(route["idTravel"]);
      this.idStep_ =  parseInt(route["idStep"]);

      
      this._api.getTravel(this.idTravel).subscribe(travel => {
        this.travelService.setTravel(travel);
        this.steps = travel.steps.features;
        this.step = this.travelService.travel.steps.features.find(step => {
          return step.id == this.idStep_
        });
        this.stepIndexInTravel = travel.steps.features.map(step => step.id).indexOf(this.idStep_) | 0;
        
        // UGLY
        setTimeout(() => {          
          this._mapService.displayTravelLine(travel.steps);
          this._mapService.zoomOnLayer(this.idStep_, 10);
        }, 500)
      });      
    })
  }

  open(index) {
    this._lightbox.open(this.step.properties.medias, index);
  }

  nextStep() {    
    const nextIndex = this.stepIndexInTravel + 1;
    if(nextIndex == this.steps.length) {
      console.log("last step");
      
    } else {
      const nextIdStep = this.steps[nextIndex].id;
      this._router.navigate(["travel", this.idTravel, "step", nextIdStep])
    }
  }

  previousStep() {
    const previousIndex = this.stepIndexInTravel - 1;
    
    if(previousIndex < 0) {
      console.log("first step");
      
    } else {
      console.log(this.steps);
      
      const previousIdStep = this.steps[previousIndex].id;
      this._router.navigate(["travel", this.idTravel, "step", previousIdStep])
    }
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




        // let swippperStartIndex = 
        // console.log(swippperStartIndex);
        
        // const swiperEl = document.querySelector('swiper-container');
        // const swiperParams = {
        //   slidesPerView: 1,
        //   pagination: true,
        //   initialSlide: swippperStartIndex,
        // };
    
        // Object.assign(swiperEl, swiperParams);
    
        // // and now initialize it
        // swiperEl.initialize();
        // this.swiper = this.swiperRef?.nativeElement.swiper;
        // var t = document.getElementById("lala"); t
        // swiperEl.addEventListener('swiperslidechange', (event) => {
        //   // pas moyen d'avoir le "activeSlide" via l'API et sans timeout on 
        //   // retrouve la slide d'avant...
        //   setTimeout(() => {
        //     // on doit remetre la 
        //     swiperEl.style.height = "auto"
        //     const activeSlide = document.getElementsByClassName("swiper-slide-active")[0];
        //     const currentHeight = (activeSlide as HTMLElement).offsetHeight;
        //     // très moche
        //     swiperEl.style.height =  currentHeight.toString()+"px";
        //   }, 200);        
        //   this._mapService.zoomOnLayer(this.steps[this.swiper.activeIndex].id);
        // });      