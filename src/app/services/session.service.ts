import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class SessionService {

    constructor() { }

    setProjectId(value: string) {
        sessionStorage.setItem("projectId", value);
    }
    getProjectId(): any {
        return sessionStorage.getItem("projectId");
    }
    projectLoaded(): boolean {
        return (sessionStorage.getItem("projectId") != null)
    }
    setProjectName(value: string) {
        sessionStorage.setItem("projectName", value);
    }
    getProjectName(): any {
        return sessionStorage.getItem("projectName");
    }
    deleteProjectId() {
        sessionStorage.removeItem("projectId");
    }
    deleteProjectName() {
        sessionStorage.removeItem("projectName");
    }
   
}