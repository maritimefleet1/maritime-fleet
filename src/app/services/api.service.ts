import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vessel, ApiResponse } from '../models/vessel.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    // Standardizes the URL to http://localhost:8081/api/vessels
    let api = environment.apiUrl;
    if (!api.endsWith('/')) api += '/';
    this.baseUrl = api + 'api';
  }

  // 1. Fixed URL: http://localhost:8081/api/vessels/search
  getVesselsPaged(page: number, size: number, name: string, statuses: string[]): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('name', name);
    
    statuses.forEach(s => { params = params.append('statuses', s); });

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/vessels/search`, { params });
  }

  // 2. Add: POST http://localhost:8081/api/vessels
  addVessel(vessel: Vessel): Observable<ApiResponse<Vessel>> {
    return this.http.post<ApiResponse<Vessel>>(`${this.baseUrl}/vessels`, vessel);
  }

  // 3. Edit: PUT http://localhost:8081/api/vessels/{id}
  updateVessel(id: number, vessel: Vessel): Observable<ApiResponse<Vessel>> {
    return this.http.put<ApiResponse<Vessel>>(`${this.baseUrl}/${id}`, vessel);
  }

  // 4. Soft Delete: PATCH http://localhost:8081/api/vessels/{id}/status
  softDelete(id: number): Observable<ApiResponse<Vessel>> {
    return this.http.patch<ApiResponse<Vessel>>(`${this.baseUrl}/vessels/${id}/status`, null, {
      params: new HttpParams().set('status', 'Deleted')
    });
  }
  getSheets(vesselId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vessels/${vesselId}/sheets`);
  }

  createSheet(vesselId: number, sheetData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/vessels/${vesselId}/sheets`, sheetData);
  }
  addItem(itemData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/items`, itemData);
  }
  getItemsBySheet(sheetId: number, page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'id')
      .set('sortDir', 'desc');

    return this.http.get(`${this.baseUrl}/items/sheet/${sheetId}`, { params });
  }
  addDelivery(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/deliveries`, payload);
  }
  getDeliveryHistory(itemId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/deliveries/item/${itemId}`);
  }
  getPrintData(sheetId: number, page: number, size: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/deliveries/sheet/${sheetId}/print?page=${page}&size=${size}`);
  }
}