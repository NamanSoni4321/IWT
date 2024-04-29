import { Component, EventEmitter, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../interface/logout.interface';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  onEmitStatus = new EventEmitter();
  details: DialogData;
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: DialogData) { }

  ngOnInit(): void {
    if (this.dialogData) {
      this.details = this.dialogData;
    }
  }

  handleChangeAction() {
    this.onEmitStatus.emit();
  }

}
