import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from "leaflet"
import { latLng } from 'leaflet';
import 'leaflet-polylinedecorator';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnChanges {
  @Input() geojson: any;
  public map: L.Map;
  ngOnInit(): void {
    
    this.map = L.map('map').setView([51.505, -0.09], 12);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 12
    }).addTo(this.map);
//     var pathPattern = (L as any).polylineDecorator(
//       [ [ 49.543519, -12.469833 ], [ 49.808981, -12.895285 ], [ 50.056511, -13.555761 ], [ 50.217431, -14.758789 ], [ 50.476537, -15.226512 ], [ 50.377111, -15.706069 ], [ 50.200275, -16.000263 ], [ 49.860606, -15.414253 ], [ 49.672607, -15.710152 ], [ 49.863344, -16.451037 ], [ 49.774564, -16.875042 ], [ 49.498612, -17.106036 ], [ 49.435619, -17.953064 ], [ 49.041792, -19.118781 ], [ 48.548541, -20.496888 ], [ 47.930749, -22.391501 ], [ 47.547723, -23.781959 ], [ 47.095761, -24.941630 ], [ 46.282478, -25.178463 ], [ 45.409508, -25.601434 ], [ 44.833574, -25.346101 ], [ 44.039720, -24.988345 ] ],
//       {
//           patterns: [
//               { offset: 12, repeat: 25, symbol: (L as any).Symbol.dash({pixelSize: 10, pathOptions: {color: '#f00', weight: 2}}) },
//               { offset: 0, repeat: 25, symbol: (L as any).Symbol.dash({pixelSize: 0}) },
//               {offset: 25, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}

//           ]
//       }
//   ).addTo(this.map);
//   var multiCoords1 = [
//     [[47.5468, -0.7910], [48.8068, -0.1318], [49.1242, 1.6699], [49.4966, 3.2958], [51.4266, 2.8564], [51.7542, 2.1093]],
//     [[48.0193, -2.8125], [46.3165, -2.8564], [44.9336, -1.0107], [44.5278, 1.5820], [44.8714, 3.7353], [45.8287, 5.1855], [48.1953, 5.1416]],
//     [[45.9205, 0.4394], [46.7699, 0.9228], [47.6061, 2.5488], [47.7540, 3.3837]]
// ];
//   var plArray = [];
//   for(var i=0; i<multiCoords1.length; i++) {
//       plArray.push((L.polyline as any)(multiCoords1[i]).addTo(this.map));
//   }
//   (L.polylineDecorator as any)(multiCoords1, {
//       patterns: [
//           {offset: 25, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}
//       ]
//   }).addTo(this.map);

//   var markerLine = L.polyline([[58.44773, -28.65234], [52.9354, -23.33496], [53.01478, -14.32617], [58.1707, -10.37109], [59.68993, -0.65918]], {}).addTo(this.map);
//   var markerPatterns = L.polylineDecorator(markerLine, {
//       patterns: [
//           { offset: '5%', repeat: '10%', symbol: L.Symbol.marker()},
//           {offset: 25, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}

//       ]
//   }).addTo(this.map);

  
    
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
          console.log(feature.geometry.coordinates);
          
          arrayCoords.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]])
        });
        const polyline = L.polyline(arrayCoords).addTo(this.map);        
        this.map.addLayer(polyline);
          var markerPatterns = L.polylineDecorator(polyline, {
      patterns: [
          {offset: 25, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}

      ]
  }).addTo(this.map);

      }
      
    }
    
  }
}
