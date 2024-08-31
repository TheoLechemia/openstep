import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

import { ApiService } from '../api.service';
import { MapService } from '../map.service';
@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [MapComponent, RouterLink, RouterOutlet],
  templateUrl: './travels.component.html',
  styleUrl: './travels.component.scss',
  providers: [MapService]
})
export class TravelsComponent implements OnInit {
  public travels: Array<any> = [];
  public geojson:any;
  constructor(private _api: ApiService, private _mapService: MapService) {}

  ngOnInit(): void {
    this._api.getTravels().subscribe((travels: Array<any>) => {
      this.travels = travels;
      const generatedGeojson = {
        "type": "FeatureCollection",
        "features": []
      }
      this.travels.forEach(travel => {
        if (travel.steps.features.length > 0 ) {
          generatedGeojson.features.push(travel.steps.features[0])
        }
      });
      this.geojson = generatedGeojson;
      
    })
  }

  pointToLayer(feature, latLng) {    
    const marker = this._mapService.pointToLayer(feature, latLng);
    marker.bindPopup( `<h3> <a href="./#/travel/${feature.properties.travel.id}"> ${feature.properties.travel.name} </a> </h3>`);
    marker.on('click', function (e) {
        this.openPopup();
    });
    return marker;
  }

}
