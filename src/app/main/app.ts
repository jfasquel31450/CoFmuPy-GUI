import {Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FmuService } from 'src/app/services/fmu-service';
import { ProjectService } from 'src/app/services/project.service';
import { SessionService } from 'src/app/services/session.service';
import { ProjectComponent } from 'src/app/components/project/project.component';
import { CreateProjectFormComponent } from 'src/app/components/project/create-project-form/create-project-form.component';
import { EditCosimulation } from 'src/app/components/edit-cosimulation/edit-cosimulation';
import { HeaderToolbarComponent } from 'src/app/components/header-toolbar/header-toolbar.component';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, 
    CommonModule,
    ProjectComponent, 
    CreateProjectFormComponent,
    EditCosimulation,
    HeaderToolbarComponent
  ],
  templateUrl: 'app.html',
  styleUrls: ['./app.css']
})
export class App {
  messages:any = [];
  title = 'CoFmPy-Gui';
  projectLoaded:boolean = false;
  project: any;

  projectState: number = 0;
  projectIdToModify: any;

  use_case: any;
  fmu_details:any;
  /**
   * Creates an instance of App.
   * App is the main component which contains all other components.
   * It load project and dispatch project information to other components
   *
   * @constructor
   * @param {FmuService} fmuService 
   * @param {ProjectService} projectService 
   * @param {SessionService} sessionService 
   * @param {WebSocketService} websocketService 
   */
  constructor(private fmuService:FmuService, 
    private projectService:ProjectService, 
    private sessionService:SessionService,
    private websocketService: WebSocketService) { }


  /** 
   * Method called after Angular has initialized all data-bound properties.
   * Contains additional initialization tasks
   */
  ngOnInit() {
    this.websocketService.listen('message').subscribe((data:any) => {
      console.log('Receive message '+JSON.stringify(data))
      this.messages.push(data);
    });
  }

  /**
   * Method called after Angular has fully initialized component's view.
   * Contains additional initialization tasks
   */
  ngAfterViewInit(): void {
    this.retrieveCurrentProject();
  }

  /**
   * This method request current project to the backend 
   * current project id and name are store into the sessionManager
   */
  retrieveCurrentProject() {
    if (this.sessionService.getProjectId() == null) {
      return;
    }
    // Load project and parameters
    this.projectService.loadProject(this.sessionService.getProjectId(), this.sessionService.getProjectName(), (project:any) => {
      this.projectLoaded = true;
      this.project = project;
    });
  }
  /**
   * Send a message to websocket, normally connected to backend application
   *
   * @param {string} message message to send via websocket
   */
  sendMessage(message: string) {
    this.websocketService.emit('message', message);
  }

  /** Method called to display view to create project */
  showCreateProjectForm() {
    this.projectState = 1;
  }
  /**
   * Method called to display view to edit project
   *
   * @param {*} project the project to edit
   */
  showEditProjectForm(project: any) {
    this.projectIdToModify = project;
    this.projectState = 2;
  }
  /** Description placeholder */
  showLoadProjectForm() {
    this.projectState = 0;
  }

  /**
   * Start simulation on selected project with given parameters.\
   * This simulation start with a websocket communication with backend in order to receive
   * information from backend during the simulation (progress)
   *
   * @param {*} params contains properties that define parameters for simulation : 
   * step and time
   */
  startSimulation(params:any ){
    this.websocketService.emit('start_simulation', {
      project: this.project,
      communication_time_step: params.step,
      simulation_time: params.time
    })
  }
}
