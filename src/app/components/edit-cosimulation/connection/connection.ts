import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import type { ColDef } from 'ag-grid-community'; // Column Definition Type Interface
import { GoJsConnectionComponent } from './go-js-connection/go-js-connection.component';
import { ProjectService } from 'src/app/services/project.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableConnection } from './table-connection/table-connection';

@Component({
  selector: 'app-connection',
  imports: [GoJsConnectionComponent, FormsModule, CommonModule, TableConnection],
  templateUrl: './connection.html',
  styleUrls: ['./connection.scss', '../../buttons.css']
})
export class Connection {
  @Input() project: any;
  @Output() connectionChangeEvent = new EventEmitter();
  @Output() requestFullScreenEvent = new EventEmitter();

  @ViewChild('diagram', { static: false }) diagramComponent!: GoJsConnectionComponent;
  @ViewChild('table', { static: false }) tableComponent!: TableConnection;

  isFullScreen: boolean = false;

  currentTab = 'Diagram';
  // Row Data: The data to be displayed.
  rowData = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  ];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "from_type" },
    { field: "from_fmu" },
    { field: "from_variable" },
    { field: "to_type" },
    { field: "to_fmu" },
    { field: "to_variable" }
  ];

  constructor(private projectService:ProjectService){}

  ngOnInit() {
  }
  ngAfterViewInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['connections'];
    if (chng != null && chng.currentValue != undefined) {
      // TODO
    }
    const chng2 = changes['fmus'];
    if (chng2 != null && chng2.currentValue != undefined) {
      // TODO
    }
  }
  onConnexionChange(connections:any){
    this.project.config.connections = connections;
    this.saveProject();
  }
  saveProject(){
    // Update project on server (python) side
    this.projectService.saveProject(this.project).subscribe({
      next: (response: any) => {
      }
    });
  }
  onAutoConnection() {
    // Update project on server (python) side
    this.projectService.autoConnections(this.project).subscribe({
      next: (response: any) => {
        this.connectionChangeEvent.emit();
      }
    });
  }
  onAutoLayout() {
    this.diagramComponent.autoLayout();
  }
  onAddConnection(){
    this.tableComponent.addConnection();
  }
  requestFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    this.requestFullScreenEvent.emit();
  }
}
