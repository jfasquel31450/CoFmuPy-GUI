import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { SessionService } from '../../../services/session.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  selector: 'app-create-project-form',
  templateUrl: './create-project-form.component.html',
  styleUrls: ['./create-project-form.component.css', '../../card-component.css'],
  animations:[]
})
export class CreateProjectFormComponent implements OnInit {

  @Output() showProjectSelectionEvent = new EventEmitter();
  @Output() createProjectEvent = new EventEmitter();
  @Input() projectIdToModify = '';
  @Input() title = '';
  
  projectName:string='';
  projectDescription:string = '';

  modificationSaved:boolean=false;

  newProjectForm: any; 
  
  constructor(private projectService: ProjectService, public sessionService: SessionService) { 
  }

  ngOnInit(): void {
    this.newProjectForm = new FormGroup({
      projectName: new FormControl('', Validators.required), 
      projectDescription: new FormControl(''),
    });
  }

  ngOnChanges(changes: SimpleChanges){
    const chng = changes["projectIdToModify"];
    if(chng != null){
      const cur  = JSON.stringify(chng.currentValue);
      const prev = JSON.stringify(chng.previousValue);
      if(cur!=''){
        let project = this.projectService.getProject();
        this.projectName = project.name;
        this.projectDescription = project.description;
      }
    }
  }

  createNewProject(){
    const projectName = this.newProjectForm.controls['projectName'].value;
    const projectDescription = this.newProjectForm.controls['projectDescription'].value;
    
    if(this.projectIdToModify==''){
      this.projectService.createProject(projectName, projectDescription).subscribe((projectCreationResponse:any) =>{
        if(projectCreationResponse.id != null){
          this.sessionService.setProjectId(projectCreationResponse.id);
          this.sessionService.setProjectName(projectCreationResponse.name);
          this.triggerShowProjectSelectionEvent();
          this.createProjectEvent.emit();
        }
      });
    }
    else{
      this.projectService.editProject(projectName, projectDescription, this.projectIdToModify).subscribe((projectCreationResponse:any) =>{
        if(projectCreationResponse.id != null){
          this.triggerShowProjectSelectionEvent();
          this.createProjectEvent.emit();
        }
      });
    }
    
    return false; // prevent reload
  }

  triggerShowProjectSelectionEvent(){
    this.showProjectSelectionEvent.emit();
  }

}
