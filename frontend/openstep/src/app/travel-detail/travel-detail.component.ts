import { Component, OnInit, Input } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { ApiService } from '../api.service';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { map, mergeMap } from 'rxjs';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [MapComponent, MatIcon, MatCardModule],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.scss'
})
export class TravelDetailComponent implements OnInit {
  constructor(private _api: ApiService) {}
  @Input()
  set id(idTravel: number) {
    this._api.getSteps(idTravel).pipe(
      map(steps => {
        return steps
      })
    ).subscribe(steps => {
      steps.features.forEach((step: any) => {
        this._api.getNominatimInfo(step.geometry.coordinates[1], step.geometry.coordinates[0]).subscribe(data => {
          console.log(data);
          if("address" in data) {
            step.properties.country = data.address.country;
            step.properties.state = data.address.state;
          }
          this.stepsList.push(step)
        })
      });
      this.stepsGeoJson = steps
    })
  }
  public stepsList:any = [];
  public stepsGeoJson:any = [];
  public travel: any = {}

  ngOnInit(): void {
    
  }

}
