import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private _http: HttpClient, public configService: ConfigService) { }

  getTravels(): Observable<any> {    
    return this._http.get<any>(`${this.configService.config.API_ENDPOINT}/travels`).pipe(
      map(resp => {
        return resp["results"]
      })
    )
  }

  getTravel(idTravel:number): Observable<any> {
    return this._http.get<any>(`${this.configService.config.API_ENDPOINT}/travels/${idTravel}`)
  }

  getStep(idStep:number): Observable<any> {
    return this._http.get<any>(`${this.configService.config.API_ENDPOINT}/steps/${idStep}`)
  }

  postComment(data: any): Observable<any> {
    console.log("donc data", data);
    
    return this._http.post<any>(
      `${this.configService.config.API_ENDPOINT}/comments/`, data)
  }
}
