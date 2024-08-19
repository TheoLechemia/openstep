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
  @Input() pointToLayer: any;
  public map: L.Map;
  ngOnInit(): void {
    
    this.map = L.map('map').setView([51.505, -0.09], 12);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri',
	maxZoom: 12
    }).addTo(this.map);  
  }



  ngOnChanges(changes: SimpleChanges): void {
    if(changes["geojson"] && changes["geojson"].currentValue) {
      const layer = L.geoJson(changes["geojson"].currentValue, {
        pointToLayer : this.pointToLayer
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
