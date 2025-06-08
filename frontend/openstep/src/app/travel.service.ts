import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  public currentTravelId: number;
  public stepsObservable = new BehaviorSubject(null);;
  constructor() { 
    
  }

  setTravel(travel) {
    this.stepsObservable.next(travel)
  }

  get travel() {
    return this.stepsObservable.getValue();
  }

  get travel$(): BehaviorSubject<any> {
    return this.stepsObservable;
  }
}
