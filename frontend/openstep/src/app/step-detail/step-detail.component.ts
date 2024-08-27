import { Component, Input, inject, TemplateRef } from '@angular/core';
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


@Component({
  selector: 'app-step-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, MatSuffix, MatInputModule,MatListModule, MatFormFieldModule, MapComponent, MatDivider, CarouselModule, MatButtonModule, DatePipe,  MatIcon],
  templateUrl: './step-detail.component.html',
  styleUrl: './step-detail.component.scss',
  providers: [MapService]
})
export class StepDetailComponent  {
  constructor(private _api: ApiService) {}
  public step:any;
  readonly dialog = inject(MatDialog);


  comments = [
    {"message" : "ah oausi de ouf", "date": "01/01/2022"},
    {"message" : "MAIS NAN", "date": "01/01/2022"},
    {"message" : "SI SI", "date": "01/01/2022"},
  ]
  public commentMessage: string;
  @Input()
  set id(idStep: number) {
    this._api.getStep(idStep).subscribe(step => this.step = step);
  }


  pointToLayer(feature, latLng) {    
    let icon = L.divIcon({
      html:`<div class="observation-marker-container ${feature.properties.isLastStep ? "last-step": ""}">
          </div>
        </div>`,
      className: 'observation-marker',
      iconSize: 32,
      iconAnchor: [18, 28],
    } as any);
    return L.marker(latLng, {icon: icon});
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
