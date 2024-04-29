import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/Auth/auth.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public customerCount: number = 0;
  public plansCount: number = 0;
  public projectCount: number = 0;
  public totalAmount: number = 0;
  public isPieComponent: boolean = false;
  public isLineComponent: boolean = false;
  public activeCustomerData:number = 0;
  public inActiveCustomerData: number = 0;
  public activeLineCustomer: {};
  public activeLineProject: {};

  constructor(
    private toastr: ToastrService,
    private dataService: AuthService,
    private ngxloader: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxloader.start();
    this.dataService.dashboard().subscribe((count) => {
      if(count?.body){
      this.customerCount = count.body.users;
      this.plansCount = count.body.plans;
      this.projectCount = count.body.projects;
      this.totalAmount = count.body.amount;
      this.activeCustomerData = count.body.completed;
      this.inActiveCustomerData = count.body.notCompleted;
      this.activeLineCustomer = count.body.monthUser;
      this.activeLineProject = count.body.monthProject;
      this.isPieComponent = true;
      this.isLineComponent= true;  
      }   
    })
    this.ngxloader.stop();
  }
}
