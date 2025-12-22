import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

const UPLOAD_FMU_URL = '/api/fmu/upload';
const EDIT_FMUS_URL = '/api/fmu/edit';
const EDIT_INITIALIZATION_FMU_URL = '/api/fmu/initialization/edit';
const FMU_INFORMATION_URL = '/api/fmu/information';
const FMU_INFORMATION2_URL = '/api/fmu/information2';
const FMU_INFORMATION3_URL = '/api/fmu/information3';
const DELETE_FMU_URL = '/api/fmu/delete';

@Injectable({
  providedIn: 'root'
})
export class FmuService {

  /**
   * Creates an instance of FmuService.\
   * This file contains all expected methods to interface with 
   * backend application for all actions around fmus
   *
   * @constructor
   * @param {HttpService} httpService Basic service for Http communication
   */
  constructor(private httpService: HttpService) { }

  /**
   * Upload FMU file with caracteristics ; id, name
   *
   * @param {*} files Files to upload, normally 1 file per request
   * @param {*} project Related project for the request
   * @param {*} fmu FMU caracteristics
   * @returns {*} A promise with success/error information on request
   */
  sendFmus(files: any, project: any, fmu: any) {

    const formData = new FormData();
    formData.append('projectId', project.id);
    formData.append('projectName', project.name);
    formData.append('fmu', JSON.stringify(fmu));
    for (let i = 0; i < files.length; i++) {
      formData.append(files.item(i).name, files.item(i));
    }
    return this.httpService.uploadFile(UPLOAD_FMU_URL, formData);
  }
  /**
   * Request edit global FMUs list and caracteristics of the project
   *
   * @param {*} project Related project for the request
   * @param {*} fmus FMU list with all caracteristics
   * @returns {*} A promise with success/error information on request
   */
  editFmus(project: any, fmus: any){
    const formData = new FormData();
    formData.append('projectId', project.id);
    formData.append('projectName', project.name);
    formData.append('fmus', JSON.stringify(fmus));

    return this.httpService.uploadFile(EDIT_FMUS_URL, formData);
  }
  /**
   * Request new variable initialization for the given FMU
   *
   * @param {*} project Related project for the request
   * @param {*} fmu FMU caracteristics
   * @param {*} variable variable to initialize, object containing id, name, value, ...
   * @returns {*} A promise with success/error information on request
   */
  editFmuInitialization(project: any, fmu: any, variable: any){
    const formData = new FormData();
    formData.append('projectId', project.id);
    formData.append('projectName', project.name);
    formData.append('fmuId', fmu.id);
    formData.append('fmuName', fmu.name);
    formData.append('variable', JSON.stringify(variable));
    return this.httpService.requestPost(EDIT_INITIALIZATION_FMU_URL, formData);
  }
  /**
   * Request delete FMU
   *
   * @param {*} project Related project for the request
   * @param {*} fmu FMU caracteristics
   * @returns {*} A promise with success/error information on request
   */
  deleteFmu(project: any, fmu:any){
    const formData = new FormData();
    formData.append('projectId', project.id);
    formData.append('projectName', project.name);
    formData.append('fmu', JSON.stringify(fmu));
    return this.httpService.requestPost(DELETE_FMU_URL, formData);
  }
  /**
   * Retrieve FMU variables with table format
   *
   * @param {*} project Related project for the request
   * @param {*} fmu FMU caracteristics
   * @returns {*} A promise with success/error information on request\
   * On success, response will contains FMU variables with table format.
   */
  getFmuInfo2(project: any, fmu:any){
    const formData = new FormData();
    formData.append('projectId', project.id);
    formData.append('projectName', project.name);
    formData.append('fmu', JSON.stringify(fmu));

    return this.httpService.requestPost(FMU_INFORMATION2_URL, formData);
  }
  /**
   * Retrieve FMU information : 
   * - General information on the fmu and the cosimulation
   * - FMU variables list
   *
   * @param {*} project Related project for the request
   * @param {*} fmu FMU caracteristics
   * @returns {*} A promise with success/error information on request\
   * On success, response will contains all FMU information.
   */
  getFmuInfo3(project: any, fmu:any){
    const formData = new FormData();
    formData.append('projectId', project.id);
    formData.append('projectName', project.name);
    formData.append('fmu', JSON.stringify(fmu));

    return this.httpService.requestPost(FMU_INFORMATION3_URL, formData);
  }
}
