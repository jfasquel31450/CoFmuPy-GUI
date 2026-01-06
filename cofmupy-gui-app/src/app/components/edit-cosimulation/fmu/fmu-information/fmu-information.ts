import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { CellEditingStoppedEvent, ColDef, colorSchemeDark, GridApi, GridReadyEvent, ICellRendererParams, themeQuartz } from 'ag-grid-community';
import { FmuService } from 'src/app/services/fmu-service';

@Component({
  selector: 'app-fmu-information',
  imports: [AgGridAngular, CommonModule, FormsModule],
  templateUrl: './fmu-information.html',
  styleUrl: './fmu-information.scss',
})
export class FmuInformation {
  @Input() fmu: any;
  @Input() project: any;

  gridOptions = {
    rowHeight: 30
  }
  gridApi!: GridApi;
  gridTheme: any = themeQuartz.withPart(colorSchemeDark);
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "causality", headerName: "Category", sort: 'asc', filter: true },  // Default sort by causality
    { field: "name" },
    {
      field: "initialization",
      editable: (params: any) => params.data.causality == 'input' || params.data.causality == 'parameter' ? true : false,
      cellRenderer: (params: ICellRendererParams) => {
        if(params.value){
          if (params.data.causality != 'input' && params.data.causality != 'parameter')
            return `<span class="text-secondary"><b>${params.value}</b></span>`
          if (params.data.causality == 'input' || params.data.causality == 'parameter'){
            if(params.data.initialization != params.data.start)
              return `<span class="text-success"><b>${params.value}</b></span>`
            else
              return `<span class="text-white-50"><b>${params.value}</b></span>`
          }
          else
            return `<span class="text-warning"><b>${params.value}</b></span>`
        }
        else return ``
      }
    },
    { field: "type" }
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
    const chng = changes['fmu'];
    if (chng != null && chng.currentValue != undefined) {
      this.fmuService.getFmuInfo3(this.project, this.fmu).subscribe({
        next: (response: any) => {
          this.fmu.info = response;
          this.fmu.info.modelVariables.forEach((variable:any) => {
            if(this.fmu.initialization[variable.name])
              variable.initialization = this.fmu.initialization[variable.name];
            else
              variable.initialization = variable.start
          })
        }
      });
    }
  }
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setGridOption("headerHeight", 30)
  }

  onCellEditingStopped(params: CellEditingStoppedEvent) {

    if (!params.valueChanged || params.rowIndex == null) return;

    console.log('Value change from ' + params.data.start + ' to ' + params.value)
    console.log('Value change to ' + params.value + ' on ' + params.colDef.field + ' for variable ' + params.data.name)
    params.data.initialization = params.value;
    this.gridApi.refreshCells({force: true})

    // Change initialization for FMU
    this.fmuService.editFmuInitialization(this.project, this.fmu, params.data).subscribe({
      next: (response: any) => {
        this.fmu.initialization[params.data.name] = params.data.initialization;
      }
    });

  }
}
