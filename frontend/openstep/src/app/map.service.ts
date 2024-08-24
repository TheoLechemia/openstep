import { Injectable } from '@angular/core';
import * as L from "leaflet"

@Injectable()
export class MapService {
  map: L.Map;
  layers: any = {};
  constructor() { }

  pointToLayer(feature, latLng) {    
    const icon = this.getIcon(feature, false);
    const marker = L.marker(latLng, {icon: icon});
    marker.getLatLng
    this.layers[feature.id] = marker;
    return marker;
  }


  getIcon(feature, selected:boolean= false) {
    console.log("oHHHH", selected);
    
    return L.divIcon({
      html:`<div class="observation-marker-container ${selected ? "selected-marker": ""} ${feature.properties.isLastStep ? "last-step": ""}">
          </div>
        </div>`,
      className: 'observation-marker',
      iconSize: 32,
      iconAnchor: [18, 28],
    } as any);
  }

  displayTravelLine(geojson) {
    const arrayCoords = [];
    geojson.features.forEach(feature => { 
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
