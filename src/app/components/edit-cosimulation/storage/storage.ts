import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular'; // Angular Data Grid Component
import { colorSchemeDark, ICellRendererParams, themeQuartz, type ColDef } from 'ag-grid-community'; // Column Definition Type Interface

@Component({
  selector: 'app-storage',
  imports: [AgGridAngular, FormsModule, CommonModule],
  templateUrl: './storage.html',
  styleUrl: './storage.scss'
})
export class Storage {
  @Input() storages:Array<any> = [];

  gridTheme: any = themeQuartz.withPart(colorSchemeDark);
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "name" },
    { field: "type" },
    {
      field: "config",
      cellRenderer: CellRendererJson,
      autoHeight: true
    }
  ];

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['storages'];
    if (chng != null && chng.currentValue != undefined) {
    }
  }

}
@Component({
  imports: [CommonModule, FormsModule],
  selector: 'cell-render-json',
  template: '<div *ngFor="let item of value | keyvalue">{{item.key}} : {{item.value}}</div>'
})
export class CellRendererJson implements ICellRendererAngularComp {
  params: any;
  value: any;

  constructor(public vcRef: ViewContainerRef) {
  }

  // gets called once before the renderer is used
  agInit(params: any): void {
    this.value = params.value;
    this.params = params;
  }
  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
