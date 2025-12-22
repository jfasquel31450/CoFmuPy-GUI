import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular'; // Angular Data Grid Component
import { CellEditingStoppedEvent, colorSchemeDark, GridApi, GridReadyEvent, ICellRendererParams, themeQuartz, type ColDef } from 'ag-grid-community'; // Column Definition Type Interface
import { UploadFile } from './upload-file/upload-file';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FmuService } from 'src/app/services/fmu-service';
import { FmuInformation } from './fmu-information/fmu-information';

@Component({
  selector: 'app-fmu',
  imports: [AgGridAngular, UploadFile, FormsModule, CommonModule, FmuInformation],
  templateUrl: './fmu.html',
  styleUrls: ['./fmu.scss', '../../buttons.css']
})
export class Fmu {
  @Input() project: any;
  @Input() fmus: Array<any> = [];
  @Output() fmuUploadedEvent = new EventEmitter();
  @Output() fmuDeleteEvent = new EventEmitter();
  @Output() fmuEditEvent = new EventEmitter();
  @Output() requestFullScreenEvent = new EventEmitter();

  fmusTabs: Array<any> = [];

  isFullScreen:boolean = false;
  currentTab:string = 'Summary';
  selectedFmu: any;
  newFmuRequested:boolean = false;

  gridOptions = {
    rowHeight: 30
  }
  gridApi!: GridApi;
  gridTheme: any = themeQuartz.withPart(colorSchemeDark);
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "id" },
    { field: "name",
      editable: true,
      cellRenderer: (params: ICellRendererParams) => {
        return `<span><b>${params.value}</b></span>`
      }
    },
    { field: "path" },
    {
      field: "actions", 
      headerName: "", 
      width: 50,
      cellRenderer: CellRendererEditFmu,
      cellRendererParams: {
        readOnly: false,
        onDeleteFmu: (data: any) => {
          this.fmuService.deleteFmu(this.project, data).subscribe({
            next: (response: any) => {
              this.fmuDeleteEvent.emit(data);
            }
          });
        },
        onRequestCopyFmuInfo: (data: any) => {
          this.fmuService.getFmuInfo2(this.project, data).subscribe({
            next: (response: any) => {
              navigator.clipboard.writeText(response.content);
            }
          });
        },
        onRequestShowFmuInfo: (data: any) => {
          if (this.fmusTabs.indexOf(data) != -1){

          }
          else{
            this.fmusTabs.push(data);
          }
          this.selectedFmu = data;
          this.currentTab = data.name;
        }
      }
    }
  ];

  constructor(private fmuService: FmuService) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    window.addEventListener('resize', (event) => {
      this.gridApi.sizeColumnsToFit();
    }, true);
  }
  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['fmus'];
    if (chng != null && chng.currentValue != undefined) {
      // TODO
    }
    const chng2 = changes['project'];
    if (chng2 != null && chng2.currentValue != undefined) {
      // TODO
    }
  }
  onRequestNewFmu(newFmu: boolean = false) {
    this.newFmuRequested = newFmu;
    setTimeout(() => {
      if(this.gridApi)
        this.gridApi.sizeColumnsToFit();
    }, 10);
  }
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setGridOption("headerHeight", 30)
  }

  onCellEditingStopped(params: CellEditingStoppedEvent) {
    if (!params.valueChanged || params.rowIndex == null) return;

    this.fmuService.editFmus(this.project, this.fmus).subscribe({
      next: (response: any) => {
        this.fmuEditEvent.emit();
      }
    });

  }
  requestFullScreen(){
    this.isFullScreen = !this.isFullScreen;
    this.requestFullScreenEvent.emit();
  }
  removeFmuFromTabs(fmu:any){
    this.currentTab = 'Summary';
    this.selectedFmu = undefined;
    this.fmusTabs.splice(this.fmusTabs.indexOf(fmu), 1);
  }
}
@Component({
  imports: [CommonModule, FormsModule],
  selector: 'cell-render-edit-fmu',
  template: `<span>
              <span class= "tool_button" (click)="deleteFmu()" title="Delete fmu and its connections" style="cursor: pointer;">
                <i class="bi bi-trash3"></i>
              </span>
              <span class= "tool_button ms-2" (click)="copyFmuInfo()" title="Copy fmu info to clipboard" style="cursor: pointer;">
                <i class="bi bi-clipboard-data"></i>
              </span>
              <span class= "tool_button ms-2" (click)="showFmuInfo()" title="Show fmu info" style="cursor: pointer;">
                <i class="bi bi-info-circle"></i>
              </span>
            </span>`
})
export class CellRendererEditFmu implements ICellRendererAngularComp {
  params: any;
  value: any;

  constructor(public vcRef: ViewContainerRef) {
  }

  // gets called once before the renderer is used
  agInit(params: any): void {
    this.value = params.value;
    this.params = params;
  }
  deleteFmu(){
    this.params.onDeleteFmu(this.params.node.data);
  }
  copyFmuInfo(){
    this.params.onRequestCopyFmuInfo(this.params.node.data);
  }
  showFmuInfo(){
    this.params.onRequestShowFmuInfo(this.params.node.data);
  }
  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}