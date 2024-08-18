import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private _http: HttpClient) { }

  getTravels(): Observable<any> {
    return this._http.get<any>("http://127.0.0.1:8000/api/travels").pipe(
      map(resp => {
        return resp["results"]
      })
    )
  }

  getTravel(idTravel:number): Observable<any> {
    return this._http.get<any>(`http://127.0.0.1:8000/api/travels/${idTravel}`)
  }

  getStep(idStep:number): Observable<any> {
    return this._http.get<any>(`http://127.0.0.1:8000/api/step/${idStep}`)
  }

  getSteps(idTravel: number): Observable<any>  {
    return this._http.get<any>("http://127.0.0.1:8000/api/steps/", {params: {"travel": idTravel}}).pipe(
      map(resp => {
        return resp["results"]
      })
    )
  }

  getNominatimInfo(x: number, y: number): Observable<any>  {
    return this._http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${x}&lon=${y}`)
  }
}
