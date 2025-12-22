import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { CellEditingStoppedEvent, ColDef, colorSchemeDark, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams, themeQuartz } from 'ag-grid-community';

@Component({
  selector: 'app-table-connection',
  imports: [AgGridAngular, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './table-connection.html',
  styleUrl: './table-connection.scss',
})
export class TableConnection {
  @Input() connections: any;
  @Input() fmus: any;

  @Output() projectChangeEvent = new EventEmitter();

  addConnectionMode: boolean = false;
  newConnectionForm = new FormGroup({
    source_type: new FormControl('', Validators.required),
    source_id: new FormControl('', Validators.required),
    source_variable: new FormControl('', Validators.required),
    target_type: new FormControl('', Validators.required),
    target_id: new FormControl('', Validators.required),
    target_variable: new FormControl('', Validators.required)
  });
  sourceVariables: any = [];
  targetVariables: any = [];

  connectionTypes = ['fmu'];

  gridOptions = {
    rowHeight: 30
  }
  gridApi!: GridApi;
  gridTheme: any = themeQuartz.withPart(colorSchemeDark);
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [];
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['connections'];
    if (chng != null && chng.currentValue != undefined) {
      //this.rowsData = JSON.parse(JSON.stringify(this.connections));
    }
    const chng2 = changes['fmus'];
    if (chng2 != null && chng2.currentValue != undefined) {
      this.initColDefs();
    }
  }
  initColDefs(){
    this.colDefs = [
      {
        field: "source.type",
        width: 100,
      },
      {
        field: "source.id",
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: this.fmus.map((fmu: any) => fmu.id)
        }
      },
      {
        field: "source.variable",
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params:any) => {
          return {
            values: this.findVariablesForFmu(params.data.source.id, false),
            allowTyping: true,
            filterList: true,
            highlightMatch: true
          }
        }
      },
      {
        field: "target.type",
        width: 100
      },
      {
        field: "target.id",
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: this.fmus.map((fmu: any) => fmu.id)
        }
      },
      { field: "target.variable" },
      {
        field: "actions",
        headerName: "",
        width: 60,
        cellRenderer: CellRendererEditConnection,
        cellRendererParams: {
          readOnly: false,
          onDeleteConnection: (data: any) => {
            this.connections = this.connections.filter((connection: any) => {
              return connection.source.id != data.source.id || connection.source.variable != data.source.variable
                && connection.target.id != data.target.id || connection.target.variable != data.target.variable
            })
            this.projectChangeEvent.emit(this.connections);

          },
          onDuplicateConnection: (data: any) => {
            this.connections.push(data);
            this.projectChangeEvent.emit(this.connections);
          }
        }
      }
    ]
  }
  findVariablesForFmu(fmu_id: any, inOrOut: boolean) {
    let fmus_found = this.fmus.filter((fmu: any) => fmu.id == fmu_id);
    if (fmus_found && fmus_found.length > 0) {
      if (inOrOut) return fmus_found[0].inputPorts.map((port: any) => port.name);
      else return fmus_found[0].outputPorts.map((port: any) => port.name);
    }
    return [];
  }
  findInputsForFmu(fmu_id:any){
    let fmus_found = this.fmus.filter((fmu:any) => fmu.id == fmu_id);
    if (fmus_found && fmus_found.length > 0){
      this.targetVariables = fmus_found[0].inputPorts.map((port:any) => port.name);
    }
  }
  findOutputsForFmu(fmu_id: any) {
    console.log('youhou ' + fmu_id)
    let fmus_found = this.fmus.filter((fmu: any) => fmu.id == fmu_id);
    if (fmus_found && fmus_found.length > 0) {
      this.sourceVariables = fmus_found[0].outputPorts.map((port: any) => port.name);
    }
  }
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setGridOption("headerHeight", 30)
  }
  onCellEditingStopped(params: CellEditingStoppedEvent) {
    if (!params.valueChanged || params.rowIndex == null) return;
  }
  addConnection(){
    this.addConnectionMode = true;
    this.newConnectionForm.controls['source_type'].setValue('fmu')
    this.newConnectionForm.controls['target_type'].setValue('fmu')
  }
  validateNewConnection(){
    
    this.connections.push({
      source: {
        type: this.newConnectionForm.getRawValue().source_type,
        id: this.newConnectionForm.getRawValue().source_id,
        variable: this.newConnectionForm.getRawValue().source_variable,
        unit: ''
      },
      target: {
        type: this.newConnectionForm.getRawValue().target_type,
        id: this.newConnectionForm.getRawValue().target_id,
        variable: this.newConnectionForm.getRawValue().target_variable,
        unit: ''
      }
    });
    this.projectChangeEvent.emit(this.connections);
  }
}
@Component({
  imports: [CommonModule, FormsModule],
  selector: 'cell-render-edit-fmu',
  template: `<span>
              <span *ngIf="!params.node.data.newLine" class= "tool_button" (click)="deleteConnection()" title="Delete connection" style="cursor: pointer;">
                <i class="bi bi-trash3"></i>
              </span>
              <span *ngIf="!params.node.data.newLine" class= "tool_button ms-2" (click)="duplicateConnection()" title="Duplicate connection" style="cursor: pointer;">
                <i class="bi bi-copy"></i>
              </span>
            </span>`
})
export class CellRendererEditConnection implements ICellRendererAngularComp {
  params: any;
  value: any;

  constructor(public vcRef: ViewContainerRef) {
  }

  // gets called once before the renderer is used
  agInit(params: any): void {
    this.value = params.value;
    this.params = params;
  }
  deleteConnection() {
    this.params.onDeleteConnection(this.params.node.data);
  }
  duplicateConnection() {
    this.params.onDuplicateConnection(this.params.node.data);
  }
  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
@Component({
  imports: [CommonModule, FormsModule],
  selector: 'cell-render-select',
  template: `<span>
              <select class="form-select" id="select" [(ngModel)]="selected" (change)="selectItem()" [ngModelOptions]="{standalone: true}">
                <option *ngFor="let item of items" [ngValue]="item">{{item}}</option>
              </select>
            </span>`
})
export class CellRendererSelect implements ICellRendererAngularComp {
  params: any;
  value: any;
  selected: any;
  items:any = [];

  constructor(public vcRef: ViewContainerRef) {
  }

  // gets called once before the renderer is used
  agInit(params: any): void {
    this.value = params.value;
    this.params = params;
    this.items = params.availableValues;
  }
  selectItem() {
    this.params.onSelectItem(this.selected);
  }
  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
