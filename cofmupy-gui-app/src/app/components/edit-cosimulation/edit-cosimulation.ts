import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Information } from './information/information';
import { Connection } from './connection/connection';
import { Fmu } from './fmu/fmu';
import { Storage } from './storage/storage';
import { HeaderToolbarComponent } from '../header-toolbar/header-toolbar.component';
import { ProjectService } from 'src/app/services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-cosimulation',
  imports: [Information, Connection, Fmu, Storage, CommonModule, FormsModule],
  templateUrl: './edit-cosimulation.html',
  styleUrls: ['./edit-cosimulation.scss', '../buttons.css']
})
export class EditCosimulation {
  @Input() project: any;
  @Output() closeProjectEvent = new EventEmitter();
  @Output() projectChangeEvent = new EventEmitter();

  savedProject: any;
  projectUpdated: boolean = false;
  fullscreenDiagram: boolean = false;
  fullscreenFmu: boolean = false;

  displayBottom: string = 'FMU';

  constructor(private projectService:ProjectService) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['project'];
    if (chng != null && chng.currentValue != undefined) {
      // Save project for undo operation
      this.savedProject = JSON.parse(JSON.stringify(this.project));
    }
  }
  requestFullScreenDiagram(){
    this.fullscreenDiagram = !this.fullscreenDiagram
    if(this.fullscreenDiagram){
      this.fullscreenFmu = false;
    }
  }
  requestFullScreenFmu() {
    this.fullscreenFmu = !this.fullscreenFmu
    if (this.fullscreenFmu) {
      this.fullscreenDiagram = false;
    }
  }
  
}
