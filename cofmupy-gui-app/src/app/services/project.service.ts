import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { SessionService } from './session.service';

const PROJECT_LIST_URL = '/api/project/list';
const PROJECT_LOAD_URL = '/api/project/load';
const PROJECT_ADD_URL = '/api/project/create';
const PROJECT_EDIT_URL = '/api/project/edit';
const PROJECT_DELETE_URL = '/api/project/delete';
const PROJECT_SAVE_URL = '/api/project/save';
const PROJECT_AUTO_CONNECTIONS_URL = '/api/project/autoconnection';


@Injectable({
    providedIn: 'root'
  })
export class ProjectService {
    cosimulationProject:CosimulationProject = {
        id: "",
        name: "",
        description: "",
        creationDate: undefined,
        modificationDate: undefined,
        cosimulationOptions: [],
        version: {},
        storages: [],
        connections: [],
        fmus: []
    };

    /**
     * Creates an instance of ProjectService.\
     * This file contains all expected methods to interface with 
     * backend application for all actions around project
     *
     * @constructor
     * @param {HttpService} httpService Basic service for Http communication
     * @param {SessionService} sessionService Service that manage web browser session
     */
    constructor(private httpService: HttpService, private sessionService:SessionService) {

    }

    /**
     * Request Project definition thanks to its id and name
     *
     * @param {string} projectId Id of the project
     * @param {string} projectName Name of the project
     * @param {*} onProjectLoadCallback Method called when request is completed and the project instance is store in Service
     */
    loadProject(projectId: string, projectName:string, onProjectLoadCallback: any) {
        let data = new FormData();
        data.append('projectId', projectId);
        data.append('projectName', projectName);
        this.httpService.requestPost(PROJECT_LOAD_URL, data).subscribe((projectResponse: any) => {
            this.cosimulationProject = projectResponse;
            onProjectLoadCallback(this.cosimulationProject);
        });
    }

    /**
     * GETTER to retrieve loaded project
     *
     * @returns {CosimulationProject} The project with all properties
     */
    getProject(){
        return this.cosimulationProject;
    }

    /**
     * Request project creation with given parameters
     *
     * @param {string} projectName Name of the project
     * @param {string} projectDescription Description of the project
     * @returns {*} A promise with success/error information on request
     */
    createProject(projectName: string, projectDescription: string|undefined){
        let dataProject = new FormData();
        dataProject.append('projectName', projectName);
        if (projectDescription)
            dataProject.append('projectDescription', projectDescription);
        else
            dataProject.append('projectDescription', "");
    
        return this.httpService.requestPost(PROJECT_ADD_URL, dataProject);
    }

    /**
     * Request project modification : name or description
     *
     * @param {string} projectName Name of the project
     * @param {string} projectDescription Description of the project
     * @param {string} projectIdToModify Existing project id to modify
     * @returns {*} A promise with success/error information on request
     */
    editProject(projectName: string, projectDescription: string | undefined, projectIdToModify: string) {
        let dataProject = new FormData();
        dataProject.append('projectName', projectName);
        if (projectDescription)
            dataProject.append('projectDescription', projectDescription);
        else
            dataProject.append('projectDescription', "");
        dataProject.append('projectId', projectIdToModify);

        return this.httpService.requestPost(PROJECT_EDIT_URL, dataProject);
    }

    /**
     * Request delete project
     *
     * @param {string} projectId Id of the project
     * @param {string} projectName Name of the project
     * @returns {*} A promise with success/error information on request
     */
    deleteProject(projectId:string, projectName:string){
        let data = new FormData();
        data.append('projectId', projectId);
        data.append('projectName', projectName);
        return this.httpService.requestPost(PROJECT_DELETE_URL, data);
    }

    /**
     * Request available projects list
     *
     * @returns {*} A promise with success/error information on request.\
     * On Success, response contains the project list
     */
    getProjectList() {
        return this.httpService.requestGet(PROJECT_LIST_URL);
    }

    /**
     * Request save project with all the caracteristics
     *
     * @param {*} project The project to save, including all caracteristics
     * @returns {*} A promise with success/error information on request
     */
    saveProject(project: any) {
        let data = new FormData();
        data.append('project', JSON.stringify(project));
        return this.httpService.requestPost(PROJECT_SAVE_URL, data);
    }
    /**
     * Request auto-connections on links between FMUS (same name, ...)
     *
     * @param {*} project Related project for the request
     * @returns {*} A promise with success/error information on request
     */
    autoConnections(project: any) {
        let data = new FormData();
        data.append('projectId', project.id);
        data.append('projectName', project.name);
        return this.httpService.requestPost(PROJECT_AUTO_CONNECTIONS_URL, data);
    }

}
/**
 * Interface that define expected format for the Project managed into the application
 *
 * @interface CosimulationProject
 * @typedef {CosimulationProject}
 */
interface CosimulationProject{
    id:string;
    name:string;
    description:string;
    creationDate:any;
    modificationDate:any;
    cosimulationOptions: any;
    storages: Array<any>;
    connections: Array<Connection>
    fmus: Array<Fmu>
    version:any;
}
/**
 * Interface that define expected format for the Connections managed into the application
 *
 * @export
 * @interface Connection
 * @typedef {Connection}
 */
export interface Connection{
    source:any;
    target:any;
}
/**
 * Interface that define expected format for the FMU managed into the application
 *
 * @export
 * @interface Fmu
 * @typedef {Fmu}
 */
export interface Fmu {
    id: string;
    name: string;
    description: string;
    path: string;
    initialisations: Array<any>
}