import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from 'src/app/services/http-service';

@Component({
  imports:[ReactiveFormsModule, FormsModule, CommonModule],
  selector: 'app-header-toolbar',
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.css', '../buttons.css']
})
export class HeaderToolbarComponent implements OnInit {
  showSimulationParam: boolean = false;
  stepSize: number = 0.001;
  simulationTime: number = 40;

  title: string = 'CoFMPy - GUI';

  @Input() projectUpdated:boolean = false;

  @Output() closeProjectEvent = new EventEmitter();
  @Output() saveProjectEvent = new EventEmitter();
  @Output() startSimulationEvent = new EventEmitter();

  constructor(private httpService: HttpService, 
    public sessionService : SessionService, 
    public router:Router) { }

  ngOnInit(): void {

  }
  
  returnHome(){
    this.router.navigate(['/']);
  }
  requestCloseProject() {
    this.sessionService.deleteProjectId();
    this.sessionService.deleteProjectName();
    this.closeProjectEvent.emit();
  }
  requestSaveProject(){
    this.saveProjectEvent.emit();
  }
  requestStartSimulation(){
    this.startSimulationEvent.emit({step: this.stepSize, time: this.simulationTime});
    this.showSimulationParam = false;
  }
}
