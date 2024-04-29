import { Component, OnInit, ViewChild, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/Auth/auth.service';
import { debounceTime } from 'rxjs/operators';
import {  Subject, Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddComponent } from '../dialog/add/add.component';
import { EditComponent } from '../dialog/edit/edit.component';
import { ToastrService } from 'ngx-toastr';
import { customer } from '../../interface/customer.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { filteredData } from '../../interface/filterData.interface';
import { PageLimit } from '../../enums/roles.enum';
import * as moment from 'moment';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  displayedColumns = ['id', 'name', 'email', 'mobileNumber', 'address', 'isCompleted', 'createdAt', 'updatedAt', 'status', 'actions'];
  dataSource = new MatTableDataSource<customer>();
  dataSourceWithPageSize = new MatTableDataSource<customer>();

  public totalItems: number = 0;
  public itemsPerPage: number = 10;
  public currentPage: number = 1;
  public index: number = 0;
  public isShowFilterInput!: boolean
  public searchKey: string = "";
  public sortList;
  public valueChanged: Subject<string> = new Subject<string>();
  public Unsubscribe$: Subscription

  constructor(private readonly dataService: AuthService,
    public dialogService: MatDialog,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) { }

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.ngxloader.start();
    this.valueChanged.pipe(debounceTime(500)).subscribe(value => {
      const filterValue: filteredData = {
        page: PageLimit.Page,
        limit: PageLimit.Limit,
        q: value.trim().toLowerCase(),
        sortField: '',
        sortValue: '',
      };
      this.search(filterValue);
      this.searchKey = filterValue.q;
    });
    this.getCustomerFromBackend({});
    this.ngxloader.stop();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.valueChanged.next(filterValue);
  }

  public showFilterInput(): void {
    this.isShowFilterInput = !this.isShowFilterInput;
  }

  openAddDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "450px"
    dialogConfig.disableClose = true;
    const dialogRef = this.dialogService.open(AddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      this.getCustomerFromBackend({});
    });
  }

  /*Paginator */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.getCustomerFromBackend({});
  }

  /* open edit dialog */
  openEditDialog(id: number, name: string, email: string, address: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "450px"
    dialogConfig.data = { id: id, name: name, email: email, address: address };
    dialogConfig.disableClose = true;
    const dialogRef = this.dialogService.open(EditComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      this.getCustomerFromBackend({});
    });
  }

  /* Delete pop up */
  deleteItem(items: customer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      message: ' Are you sure you want to Delete customer' 
    }
    const dialogRef = this.dialogService.open(ConfirmationComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatus.subscribe((data)=>{
      this.ngxloader.start();
      this.dataService.deleteCustomer(items.id).subscribe(
        (response) => {
          this.ngxloader.stop();
          this.toastr.success('Customer Delete Successfully');
        },
        (error) => {
          this.ngxloader.stop();
          console.error('Error posting data:', error);
          if (error && error.error) {
            this.toastr.error(JSON.stringify(error.error.error), 'Error');
          } else {
            this.toastr.error('An error occurred while fetching data.', 'Error');
          }
        }
      );
    })
    dialogRef.afterClosed().subscribe(result => {
      this.getCustomerFromBackend({});
    });
  }

  /*   Change the status of customer  */
  toggleStatus(item: customer): void {
    this.ngxloader.start();
    const newStatus = !item.status;
    this.dataService.updateCustomerStatus(item, newStatus).subscribe(() => {
      this.ngxloader.stop();
      item.status = newStatus;
    },(error)=>{
      this.toastr.error('An error occurred while fetching data.', 'Error');
      console.error(error);
      this.ngxloader.stop();
    });
  }

  /* Export excel */
  exportToExcel(): void {
    this.ngxloader.start();
    this.dataService.exportCustomer(this.totalItems).subscribe(
      (data) => {
        let id:number = 0; 
        const updated_data = data.body.items.map((item) => {
          return {
            ['Sr.no']: id += 1,
            Name: item.name,
            ['Mobile Number']: item.mobileNumber,
            Email: item.email,
            Address: item.address,
            ['Profile Completed']: item.isCompleted === true ? 'Completed' : 'Not Completed',
            ['User Created']: moment(item.createdAt).format('LL'),
            ['User Updated']: moment(item.updatedAt).format('LL'),
          }
        })
        this.ngxloader.stop();
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(updated_data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'customer.xlsx');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error fetching initial data:', error);
      }
    );
  }

  /* Search  */
  search(filterValue: filteredData) {
    this.dataService.getCustomer(filterValue).pipe().subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.currentPage = data.body.meta.currentPage;
        this.totalItems = data.body.meta.totalItems;
      });
  }

  currentSort: Sort = {
    active: 'id' || 'name' || 'email' || 'status' || 'mobileNumber' || 'isCompleted' || 'createdAt' || 'updatedAt',
    direction: 'asc'
  };

  /*Sorting */
  sortData(): void {
    this.ngxloader.start();
    const data = this.sortList.slice();
    this.sortList = data;
    this.localSort(this.sort, data);
    this.currentSort = this.sort;
    const sorting = {
      page: PageLimit.Page,
      sortField: this.currentSort?.active,
      sortValue: this.currentSort?.direction.toUpperCase()
    }
    this.getCustomerFromBackend(sorting);
    this.ngxloader.stop();
    return;
  }

  localSort(sort: Sort, data): void {
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a?.name, b?.name, isAsc);
        case 'email': return this.compare(a?.email, b?.email, isAsc);
        case 'mobileNumber': return this.compare(a?.mobileNumber, b?.mobileNumber, isAsc);
        case 'status': return this.compare(a?.name, b?.name, isAsc);
        case 'isCompleted': return this.compare(a?.isCompleted, b?.isCompleted, isAsc);
        case 'createdAt': return this.compare(a?.createdAt, b?.createdAt, isAsc);
        case 'updatedAt': return this.compare(a?.updatedAt, b?.updatedAt, isAsc);
        default: return 0;
      }
    });
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /* Get the customer details */
  getCustomerFromBackend(filterValue: filteredData) {
    const filteredData = {
      page: filterValue.page === undefined ? this.currentPage : filterValue.page,
      limit: this.itemsPerPage,
      q: this.searchKey,
      sortField: filterValue?.sortField === undefined ? '' : filterValue?.sortField,
      sortValue: filterValue?.sortValue === undefined ? '' : filterValue?.sortValue
    }
    this.Unsubscribe$ = this.dataService.getCustomer(filteredData).subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.sortList = data.body.items;
        this.totalItems = data.body.meta.totalItems;
      }),
      (error: Error) => {
        console.error('Error fetching data:', error);
      }
  }

  ngOnDestroy() {
    this.Unsubscribe$.unsubscribe();
  }
}