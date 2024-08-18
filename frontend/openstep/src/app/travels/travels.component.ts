import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

import { ApiService } from '../api.service';
@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [MapComponent, RouterLink, RouterOutlet],
  templateUrl: './travels.component.html',
  styleUrl: './travels.component.scss'
})
export class TravelsComponent implements OnInit {
  public travels: Array<any> = [];
  constructor(private _api: ApiService) {}

  ngOnInit(): void {
    this._api.getTravels().subscribe((travels: Array<any>) => {
      this.travels = travels;
    })
  }
}
