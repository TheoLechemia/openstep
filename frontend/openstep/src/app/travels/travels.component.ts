import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ApiService } from '../api.service';
import { MapService } from '../map.service';
import { TravelService } from '../travel.service';
@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [CommonModule, MapComponent, RouterLink, RouterLinkActive, RouterOutlet, MatCardModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './travels.component.html',
  styleUrl: './travels.component.scss',
  providers: [MapService, TravelService]
})
export class TravelsComponent implements OnInit {
  public travels: Array<any> = [];
  public geojson:any;
  constructor(private _api: ApiService, private _mapService: MapService, private stepsserv: TravelService, private _snackbar: MatSnackBar, private _router: Router) {}

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
  goToTravel(uuid: string): void {
    this._router.navigate(['/travel', uuid]);
  }

  pointToLayer(feature, latLng) {    
    const marker = this._mapService.pointToLayer(feature, latLng);
    marker.bindPopup( `<h3> <a href="./#/travel/${feature.properties.travel.uuid}"> ${feature.properties.travel.name} </a> </h3>`);
    marker.on('click', function (e) {
        this.openPopup();
    });
    return marker;
  }

  copyShareLink(travel: any): void {
    const url = `${window.location.origin}${window.location.pathname}#/travel/${travel.uuid}`;
    navigator.clipboard.writeText(url).then(() => {
      this._snackbar.open('Link copy in clipboard !', undefined, { duration: 2000 });
    });
  }

}
