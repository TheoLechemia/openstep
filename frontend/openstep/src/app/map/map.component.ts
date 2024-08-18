import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import * as L from "leaflet"
import { latLng } from 'leaflet';
import 'leaflet-polylinedecorator';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnChanges {
  @Input() geojson: any;
  public map: L.Map;
  ngOnInit(): void {
    
    this.map = L.map('map').setView([51.505, -0.09], 12);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri',
	maxZoom: 12
    }).addTo(this.map);  
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



  ngOnChanges(changes: SimpleChanges): void {
    if(changes["geojson"] && changes["geojson"].currentValue) {
      const layer = L.geoJson(changes["geojson"].currentValue, {
        pointToLayer : (feature, latLng) => {
          let icon = L.divIcon({
            html:`<div class="observation-marker-container">

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
        //   marker.on('mouseout', function (e) {
        //     this.closePopup();
        // });
          return marker;
        }
      });
      if(this.map) {
        this.map.addLayer(layer);
        this.map.fitBounds(layer.getBounds())
        
        const arrayCoords = [];
        changes["geojson"].currentValue.features.forEach(feature => {          
          arrayCoords.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]])
        });
        const polyline = L.polyline(arrayCoords, {
          className: "polyline-primary"
        }).addTo(this.map);        
        this.map.addLayer(polyline);
          var markerPatterns = L.polylineDecorator(polyline, {
            patterns: [
                {offset: 25, repeat: 120, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: "#03530a",}})}

            ]
        }).addTo(this.map);

      }
      
    }
    
  }
}
