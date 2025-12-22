import { Component, OnInit, EventEmitter, ViewChild, Output, Input } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../services/session.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css','../card-component.css'],
  animations:[]
})
export class ProjectComponent implements OnInit {

  projects: Array<any> = [];

  @Input() title = '';
  @Output() showProjectCreationCardEvent = new EventEmitter();
  @Output() modifyProjectEvent = new EventEmitter();
  @Output() loadProjectEvent = new EventEmitter();

  constructor(private projectService: ProjectService, public sessionService: SessionService) { }
  
  projectForm = new FormGroup({
    select_project: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.retrieveprojects();
  }

  retrieveprojects (){
    this.projectService.getProjectList().subscribe({
      next: (projectListResponse:any) => {
        this.projects = projectListResponse;
        if (this.projects.length > 0)
          this.projectForm.controls['select_project'].setValue(this.projects[0]);
      }
    });
    
    return false; // prevent reload
  }

  onLoadProject() {
    let projectAttributes: any = this.projectForm.controls['select_project'].value;
    this.projectService.loadProject(projectAttributes.id, projectAttributes.name, (projectReponse:any) =>{
      if(projectReponse){
        this.sessionService.setProjectId(projectReponse.id);
        this.sessionService.setProjectName(projectReponse.name);
        this.loadProjectEvent.emit()
      }
    });
    
    return false; // prevent reload
  };

  triggerShowProjectCreationCardEvent(){
    this.showProjectCreationCardEvent.emit();
  }

  /**
   * TODO: voir pourquoi il y'a une erreur.
   */
  triggerDeleteProjectEvent(){
    let projectAttributes:any = this.projectForm.controls['select_project'].value;
    this.projectService.deleteProject(projectAttributes.id, projectAttributes.name).subscribe({
      next: (returnData:any)=>{
        this.retrieveprojects();
      },
      error: (error:any) => {
        if(error.status == "409"){
          console.log('error' + JSON.stringify(error));
        }
        else if(error.status == "200"){
          this.retrieveprojects();
        }
      }
    });
    
    return false; // prevent reload
  }

  triggerModifyProjectEvent(){
    let projectAttributes:any = this.projectForm.controls['select_project'].value;
    let projectIdtoDelete = projectAttributes.id;
    this.modifyProjectEvent.emit(projectIdtoDelete);
  }

}
