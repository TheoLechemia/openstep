import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  public currentTravelUuid: string;
  public travelObservable = new BehaviorSubject(null);;
  constructor() {

  }

  setTravel(travel) {
    this.travelObservable.next(travel);
    this.currentTravelUuid = travel.uuid;
  }

  get travel() {
    return this.travelObservable.getValue();
  }

  get travel$(): BehaviorSubject<any> {
    return this.travelObservable;
  }
}
