import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FmuService } from 'src/app/services/fmu-service';

@Component({
  selector: 'app-upload-file',
  imports: [FormsModule, CommonModule],
  templateUrl: 'upload-file.html',
  styleUrls: ['./upload-file.css']
})
export class UploadFile {
  @Input() project: any;
  @Output() fmuUploadedEvent = new EventEmitter();
  @Output() cancelUploadedEvent = new EventEmitter();

  selectedFiles:any = [];
  fmu:any = {};

  constructor(private fmuService:FmuService) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    const chng = changes['project'];
    if (chng != null && chng.currentValue != undefined) {
    }
  }
  onDragOver(event:any){
    const fileItems = [...event.dataTransfer.items].filter(
      (item) => {
        console.log(item.type);
        return item.kind === "file";
      },
    );
    if (fileItems.length > 0) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }
  onDropFile(event:any){
    event.preventDefault();
    this.fillFmuInfos(event.dataTransfer.files);
  }
  onFileSelected(event: any) {
    this.fillFmuInfos(event.target.files);
  }
  fillFmuInfos(files: any){
    this.selectedFiles = files;
    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.fmu.fileName = this.selectedFiles.item(i).name
    }
    this.fmu.id = this.fmu.fileName.replace(/.[^/.]+$/, '');
    this.fmu.name = this.fmu.fileName.replace(/.[^/.]+$/, '');
  }
  onUpload() {
    if(!this.project || !this.fmu || !this.selectedFiles)  return;

    this.fmuService.sendFmus(this.selectedFiles, this.project, this.fmu).subscribe({
      next: (response: any) => {
        this.fmuUploadedEvent.emit();
        this.selectedFiles = [];
        this.fmu = {};
      }
    });
  }
}
