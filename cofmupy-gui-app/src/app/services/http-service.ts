import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  /**
   * Creates an instance of HttpService. \
   * Defines and implements basic Http operation : GET, POST, Upload, ...
   *
   * @constructor
   * @param {HttpClient} httpClient  client object, from Angular common scripts, used for Http requests
   */
  constructor(private http: HttpClient) { }

  /**
   * Make a GET Request to the backend. \
   * Used to retrieve data from the backend application with limited input parameters.\
   * Parameters can be send only as path params (into the url)
   *
   * @param {string} requestPath Url of the request, absolute or relative to the application
   * @param {*} [header=null] The header for the request (Optional), default is null
   * @returns {*} A promise with success/error information on request
   */
  requestGet(requestPath: string, header: any=null) {
    let completeUrl = requestPath;
    if (header != null)
      return this.http.get<any>(completeUrl, header);
    else
      return this.http.get<any>(completeUrl);
  }

  /**
   * Make a POST Request to the backend. \
   * Used to send or retrieve data from the backend application.\
   * Parameters can be send as path params (into the url) or into the body (input param data)
   *
   * @param {string} requestPath Url of the request, absolute or relative to the application
   * @param {FormData} data data to send into the body of the request, expected as format FormData 
   * @param {*} [header=null] The header for the request (Optional), default is null
   * @returns {*} A promise with success/error information on request
   */
  requestPost(requestPath: string, data: FormData, header: any=null) {
    let completeUrl = requestPath;

    if (header != null)
      return this.http.post<any>(completeUrl, data, header);
    else
      return this.http.post<any>(completeUrl, data, { headers: { "Accept": "*/*" } });
  }
  /**
   * Make a POST Request to the backend. \
   * Used to upload file to the backend application.\
   * Parameters can be send as path params (into the url) or into the body (input param data)
   *
   * @param {string} requestPath Url of the request, absolute or relative to the application
   * @param {FormData} data data to send into the body of the request, expected as format FormData 
   * @param {*} [header=null] The header for the request (Optional), default is null
   * @returns {*} A promise with success/error information on request
   */
  uploadFile(requestPath: string, data: FormData, header: any=null) {
    let completeUrl = requestPath;
    if (header != null)
      return this.http.post<any>(completeUrl, data, header);
    else
      return this.http.post<any>(completeUrl, data, { headers: { "Accept": "*/*" } });
  }
}
