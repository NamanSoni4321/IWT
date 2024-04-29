import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Auth/auth.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() number: string;
  @Input() icon: string;

  ngOnInit(): void {
  
  }

}
