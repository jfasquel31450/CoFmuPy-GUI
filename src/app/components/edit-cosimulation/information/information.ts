import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from 'src/app/services/http-service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-information',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: 'information.html',
  styleUrls: ['./information.css', '../../buttons.css'] 
})
export class Information {
  @Input() project: any;
  savedProject: any;
  hasChange: boolean = false;
  @Output() showFmuDetails = new EventEmitter();

  constructor(private projectService:ProjectService) {}
    
  ngOnInit() {
  }
  ngAfterViewInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['project'];
    if (chng != null && chng.currentValue != undefined) {
      // Save project for undo operation
      this.savedProject = JSON.parse(JSON.stringify(this.project));
      this.hasChange = false;
    }
  }
  onChangeForm(event:any){
    this.hasChange = false;
    if(this.savedProject.name != this.project.name 
        || this.savedProject.description != this.project.description
        || this.savedProject.config.cosim_method != this.project.config.cosim_method
        || this.savedProject.config.iterative != this.project.config.iterative)
      this.hasChange = true;

  }
  saveProject() {
    // Update project on server (python) side
    this.projectService.saveProject(this.project).subscribe({
      next: (response: any) => {
        this.hasChange = false;
        this.savedProject = JSON.parse(JSON.stringify(this.project));
      }
    });
  }
}
