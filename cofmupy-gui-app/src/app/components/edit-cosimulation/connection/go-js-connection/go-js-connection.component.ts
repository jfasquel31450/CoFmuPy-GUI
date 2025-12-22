import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GoJsUtils2 } from './go-js-utils2';
import { HttpService } from '../../../../services/http-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-go-js-connection',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './go-js-connection.component.html',
  styleUrls: ['./go-js-connection.component.css', '../../../buttons.css']
})
export class GoJsConnectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() connections: any;
  @Input() fmus: any;

  @Output() projectChangeEvent = new EventEmitter();
  @Output() requestFullScreenEvent = new EventEmitter();

  @ViewChild('connectionFlowDiv', { static: false }) diagramRef!: ElementRef<HTMLDivElement>;
  
  constructor(private goJsUtils: GoJsUtils2) { }
  
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.goJsUtils.initDiagram(this.diagramRef, 
      (link: any) => this.onLinkAdded(link),
      (link: any) => this.onLinkRemoved(link),
      (link: any, oldNode: any, oldPortId: any) => this.onLinkModified(link, oldNode, oldPortId));
    if(this.fmus && this.connections)
      this.loadFromJson(this.fmus, this.connections);
  }
  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['connections'];
    if (chng != null && chng.currentValue != undefined) {
      if (this.fmus && this.connections && this.goJsUtils.myDiagram)
        this.loadFromJson(this.fmus, this.connections);
    }
    const chng2 = changes['fmus'];
    if (chng2 != null && chng2.currentValue != undefined) {
      if (this.fmus && this.connections && this.goJsUtils.myDiagram)
        this.loadFromJson(this.fmus, this.connections);
    }
  }
  ngOnDestroy(): void {

  }

  loadFromJson(use_case_fmus: any, use_case_connections: any) {
    let fmus: any = []
    use_case_fmus.forEach((fmu:any) => {
      let displayFmu: any = {};
      displayFmu.id = fmu.id;
      displayFmu.key = fmu.id;
      displayFmu.name = fmu.name;
      
      fmu.inputPorts.forEach((port:any) => {
        port.id = fmu.id + '##' + port.name;
        port.key = fmu.id + '##' + port.name;
      })
      fmu.outputPorts.forEach((port: any) => {
        port.id = fmu.id + '##' + port.name;
        port.key = fmu.id + '##' + port.name;
      })

      displayFmu.inputPorts = fmu.inputPorts;
      displayFmu.outputPorts = fmu.outputPorts;

      displayFmu.name = fmu.name /*+ " " + displayFmu.inputPorts.length + '/' + displayFmu.outputPorts.length*/;
      displayFmu.height = 26 * Math.max(displayFmu.inputPorts.length, displayFmu.outputPorts.length)+80;

      fmus.push(displayFmu);
    })

    let connections:any = [];
    use_case_connections.forEach((connection:any) => {
      if (connection.source.type == "fmu" && connection.target.type == "fmu") {
        let displayConnection: any = {};
        displayConnection.id = connection.source.id + '##' + connection.source.variable 
          + "_" + connection.target.id + '##' + connection.target.variable;
        displayConnection.key = displayConnection.id;
        displayConnection.from = connection.source.id;
        displayConnection.to = connection.target.id;
        displayConnection.fromPort = connection.source.id + '##' + connection.source.variable;
        displayConnection.toPort = connection.target.id + '##' + connection.target.variable;
        displayConnection.name = displayConnection.id;

        connections.push(displayConnection);
      }
    })
    this.goJsUtils.loadDataToDiagram(fmus, connections);

    
  }
  autoLayout(){
    this.goJsUtils.myDiagram.layoutDiagram(true);
  }
  onLinkAdded(link:any){
    console.log('Link added : '+JSON.stringify(link))

    this.connections.push({
      source: {
        id: link.from,
        type: 'fmu',
        unit: '',
        variable: link.fromPort.split('##')[1]
      },
      target: {
        id: link.to,
        type: 'fmu',
        unit: '',
        variable: link.toPort.split('##')[1]
      }
    })

    this.projectChangeEvent.emit(this.connections);
  }
  onLinkRemoved(linksDeleted: any) {
    console.log('Link removed : ' + JSON.stringify(linksDeleted))

    linksDeleted.forEach((linkDeleted:any) => {
      let index = this.connections.findIndex((connection:any) => {
        return (connection.source.id + '##' +connection.source.variable == linkDeleted.fromPort
          && connection.target.id + '##' +connection.target.variable == linkDeleted.toPort);
      });
      if(index != -1){
        this.connections.splice(index, 1);
      }
    })
    this.projectChangeEvent.emit(this.connections);

  }
  onLinkModified(linkModified: any, oldNode: any, oldPortId: any) {
    console.log('Link modified from ' + oldNode.id + '/' + oldPortId + " to " + linkModified)
    // Look for related existing connection
    this.connections.forEach((link:any) => {
      // Test for From
      if (link.from == oldNode.id && link.fromPort == oldPortId 
          && link.to == linkModified.to && link.toPort == linkModified.toPort){
        link = linkModified;
      }
    });
    this.projectChangeEvent.emit(this.connections);

  }

  saveData(){
    /*let fullData = this.engineeringDataService.getData();
    if (!fullData) {
      console.warn("No data found in storage.");
      return;
    }

    // Here assuming this diagram shows "Function" nodes:
    let model = this.goJsUtils.retrieveDiagramModel();
    const updatedFunction = model.nodeDataArray;
    const updatedFunctionalFlow = model.linkDataArray;

    // Replace the "Function" array in the full data with the updated one
    fullData.Function = updatedFunction;
    fullData.FunctionalFlow = updatedFunctionalFlow;

    // Now save the updated full data back to localStorage
    this.engineeringDataService.setData(fullData);*/
  }





}
