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
    return this._http.get<any>(`${this.configService.config.API_ENDPOINT}/travels/`).pipe(
      map(resp => resp["results"])
    )
  }

  getMyTravels(): Observable<any[]> {
    return this._http.get<any[]>(`${this.configService.config.API_ENDPOINT}/travels/mine/`);
  }

  getTravel(uuidTravel: string): Observable<any> {
    return this._http.get<any>(`${this.configService.config.API_ENDPOINT}/travels/${uuidTravel}/`)
  }

  createTravel(data: FormData): Observable<any> {
    return this._http.post<any>(`${this.configService.config.API_ENDPOINT}/travels/`, data);
  }

  getStep(idStep: number): Observable<any> {
    return this._http.get<any>(`${this.configService.config.API_ENDPOINT}/steps/${idStep}/`)
  }

  createStep(geojson: any): Observable<any> {
    return this._http.post<any>(`${this.configService.config.API_ENDPOINT}/steps/`, geojson);
  }

  updateStep(stepId: number, geojson: any): Observable<any> {
    return this._http.patch<any>(`${this.configService.config.API_ENDPOINT}/steps/${stepId}/`, geojson);
  }

  addMediaToStep(stepId: number, data: FormData): Observable<any> {
    return this._http.post<any>(`${this.configService.config.API_ENDPOINT}/steps/${stepId}/medias/`, data);
  }

  deleteMedia(mediaId: number): Observable<any> {
    return this._http.delete<any>(`${this.configService.config.API_ENDPOINT}/medias/${mediaId}/`);
  }

  postComment(data: any): Observable<any> {
    return this._http.post<any>(
      `${this.configService.config.API_ENDPOINT}/comments/`, data)
  }
}

