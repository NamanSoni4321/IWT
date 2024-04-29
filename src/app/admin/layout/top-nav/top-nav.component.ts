import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';
import { AuthService } from 'src/app/Auth/auth.service';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { notification } from '../../interface/notification.interface';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {
  @Output() sideNavToggled = new EventEmitter<void>();

  public count: number = 0;
  public id: number;
  public message: notification[];
  
  constructor(private readonly router:Router, 
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService,
    private dialog: MatDialog,
    private dataService: AuthService) { }

  ngOnInit() {
    this.requestPermission();
    this.getNotification()
  }
  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging,
      { vapidKey: environment.firebase.vapidKey }).then(
        (currentToken) => {
          if (currentToken) {
            const token = {
              fcmToken: currentToken
            }
            this.dataService.firebaseToken(token).subscribe(
              (response) => {
                console.log(response);
              },
              (error) => {
                console.error('Error posting data:', error);
              });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
  }

  toggleSidebar() {
    this.sideNavToggled.emit();
  }

  logout() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: "Are you sure want to Logout?",
    };
    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatus.subscribe((data) => {
      this.ngxloader.start();
      localStorage.clear();
      this.router.navigate(['/login']);
      this.toastr.show('Logged out');
      dialogRef.close();
      this.ngxloader.stop();
    });
  }

  getNotification(): void {
    this.dataService.getNotification().subscribe(
      (data) => {
        this.message = data.adminNotification;
        this.count = data.count;
        this.id = data.adminNotification?.[0]?.['id']
        if (data.count === 0) {
          this.message.push({
            title: 'No new notification',
          });
        }
      }),
      (error) => {
        console.error('Error fetching data:', error);
      }
  }

  notify(): void {
    const item = {
      id: this.id,
      status: true
    }
    this.dataService.notify(item).subscribe(
      (data) => {
        console.log(data);
      }, (error) => {
        console.error('Error fetching data:', error);
      }
    )
  }
}
