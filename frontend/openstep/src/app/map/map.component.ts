import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import * as L from "leaflet"
import { latLng } from 'leaflet';
import 'leaflet-polylinedecorator';
import { MapService } from '../map.service';

@Component({
  selector: 'app-map',
  standalone: true, 
  imports: [MatButtonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, OnChanges {
  constructor(public mapService: MapService) {}
  @Input() geojson: any;
  @Input() pointToLayer: any;
  public map: L.Map;
  // @ViewChild('map') mapContainer: ElementRef;
  @ViewChild('map', { static: true }) mapContainer: ElementRef;

  ngOnInit(): void {    
    this.mapService.map = L.map(this.mapContainer.nativeElement).setView([51.505, -0.09], 12);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri',
	maxZoom: 12
    }).addTo(this.mapService.map);  
  }



  ngOnChanges(changes: SimpleChanges): void {
    if(changes["geojson"] && changes["geojson"].currentValue) {      
      const layer = L.geoJson(changes["geojson"].currentValue, {
        pointToLayer : this.pointToLayer ? this.pointToLayer: this.mapService.pointToLayer.bind(this.mapService)
      });
      
      
      if(this.mapService.map) {
        this.mapService.map.addLayer(layer);
        this.mapService.map.fitBounds(layer.getBounds())

      }
      
    }
    
  }
}
