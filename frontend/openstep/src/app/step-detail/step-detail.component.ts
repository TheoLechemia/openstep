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
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';




@Component({
  selector: 'app-step-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, MatSuffix, MatInputModule,MatListModule, MatFormFieldModule, MapComponent, MatDivider, CarouselModule, LightboxModule, MatButtonModule, DatePipe,  MatIcon, CommonModule, MatProgressSpinnerModule],
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
  public uuidTravel: string;
  public currentIdtravel: number;
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


    // addEventListener("touchstart", (event) => {

    //   console.log(event);

    // });

    // addEventListener("touchmove", (event) => {

    //   console.log(event);

    // });

    // addEventListener("touchend", (event) => {

    //   console.log("enddd", event);
    //   console.log(event.changedTouches[0].pageX);


    // });


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
      const currentUuidTravel = route["uuidTravel"];
      // TODO : ne pas recharger le travel à chaque fois !!
      this.step = null;
      const swipe = document.getElementById("left-swipper");
      swipe.style.display = "none"
      this.uuidTravel = currentUuidTravel;
      this.idStep_ =  parseInt(route["idStep"]);
      if(this.travelService.travel && this.travelService.travel.uuid == currentUuidTravel) {
        this.setStepsAndStep(this.travelService.travel, this.idStep_)
      }
      if(this.travelService.travel && this.travelService.travel.uuid != currentUuidTravel) {
          this._api.getTravel(currentUuidTravel).subscribe(travel => {
          this.travelService.setTravel(travel);
          this.setStepsAndStep(travel, this.idStep_)
        });
      }
      if(!this.travelService.travel) {
        this._api.getTravel(currentUuidTravel).subscribe(travel => {
          this.travelService.setTravel(travel);
          this.setStepsAndStep(travel, this.idStep_)
        });

      }
    })
  }

  zoomOnLayer() {
    // Moche mais trouve pas comment faire d'autre
    setTimeout(()=> {
          this._mapService.zoomOnLayer(this.idStep_, 15);

      }, 200)
  }

  setStepsAndStep(travel, idStep) {
      this.stepIndexInTravel = travel.steps.features.map(step => step.id).indexOf(idStep) | 0;
      this.steps = travel.steps.features;
      this.step = travel.steps.features.find(step => {
        return step.id == idStep
      });

      this._mapService.displayTravelLine(travel.steps);

      setTimeout(()=> {
    // Moche mais trouve pas comment faire d'autre

          this._mapService.zoomOnLayer(this.idStep_, 15);

      }, 200)
  }

  goToStep(idStep) {
    this._router.navigate(['travel', this.uuidTravel, 'step', idStep]);
  }

  pointToLayer(feature, latLng) {
    // On délègue la création du marqueur au service (pour garder l'icône et
    // l'enregistrement dans layers, dont dépend zoomOnLayer), puis on ajoute
    // la navigation vers le step cliqué.
    const marker = this._mapService.pointToLayer(feature, latLng);
    if (!feature.properties.positional_step) {
      marker.on('click', () => this.goToStep(feature.id));
    }
    return marker;
  }

  open(media) {
    // ngx-lightbox n'affiche que des images : on construit un album d'images seules
    // et on retrouve l'index du média cliqué dans cette liste filtrée.
    const images = this.step.properties.medias.filter(
      (m) => m.media_type !== 'video'
    );
    const index = images.indexOf(media);
    this._lightbox.open(images, index);
  }


  nextStep() {
    let nextIndex = this.stepIndexInTravel + 1;
    let nextStepIsPositional = true;
    while(nextStepIsPositional && nextIndex != this.steps.length) {
      let nextStep = this.steps[nextIndex];
      if(nextStep.properties.positional_step) {
        nextIndex += 1;
      } else {
        nextStepIsPositional = false;
      }
    }

    if(nextIndex != this.steps.length) {
      this.goToStep(this.steps[nextIndex].id);
    }
  }

  previousStep() {
    let previousIndex = this.stepIndexInTravel - 1;
    let previousStepIsPositional = true;
    while(previousStepIsPositional && previousIndex >= 0) {
      let previousStep = this.steps[previousIndex];
      if(previousStep.properties.positional_step) {
        previousIndex -= 1;
      } else {
        previousStepIsPositional = false;
      }
    }

    if(previousIndex >= 0) {
      this.goToStep(this.steps[previousIndex].id);
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
