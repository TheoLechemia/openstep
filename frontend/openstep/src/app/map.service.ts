import { Injectable } from '@angular/core';
import * as L from "leaflet"

@Injectable()
export class MapService {
  map: L.Map;
  layers: any = {};
  constructor() {     
  }

  pointToLayer(feature, latLng) {     
    const icon = this.getIcon(feature, false);
    const marker = L.marker(latLng, {icon: icon});
    this.layers[feature.id] = marker;    
    return marker;
  }

  zoomOnLayer(idStep, zoomLevel=12) {
    
    // reset layer style not working ...
    for(let key in this.layers) {      
      const currentLayer: L.Marker = this.layers[key];
      const regularIcon = this.getIcon(currentLayer.feature, false);      
      currentLayer.setIcon(regularIcon);
    }
    const layer = this.layers[idStep];
    const selectedIcon = this.getIcon(layer.feature, true)
    layer.setIcon(selectedIcon);
    
    if(layer) {
      this.map.setView(layer.getLatLng(), zoomLevel)
    }
    
  }


  getIcon(feature, selected:boolean= false) {
    return L.divIcon({
      html:`<div class=" ${feature.properties.positional_step ? "positional-marker-container" : "observation-marker-container"} ${selected ? "selected-marker": ""} ${feature.properties.isLastStep ? "last-step": ""}">
          </div>
        </div>`,
      className: "",
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
    })
    
    polyline.addTo(this.map); 
    this.map.addLayer(polyline);
      var markerPatterns = L.polylineDecorator(polyline, {
        patterns: [
            {offset: 25, repeat: 120, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: "#0c4122",}})}

        ]
    }).addTo(this.map);
  }
}
