import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/Auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { PlanPurchase } from '../../enums/roles.enum';
import * as moment from 'moment';
import { Items } from '../../interface/transaction.interface';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'name', 'email', 'mobileNumber', 'amount', 'isActive', 'planId', 'paymentType', 'paymentStatus', 'orderId', 'transactionId', 'createdAt'];
  public dataSource = new MatTableDataSource();
  public totalItems = 0;
  public itemsPerPage = 10;
  public currentPage = 1;
  public index: number = 0;
  public isShowFilterInput!: boolean
  public searchKey: string = "";
  public sortList;
  public valueChanged: Subject<string> = new Subject<string>();

  constructor(private readonly dataService: AuthService,
    public dialogService: MatDialog,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxloader.start();
    this.valueChanged.pipe(debounceTime(500)).subscribe(value => {
      this.search(value.trim().toLowerCase());
      this.searchKey = value.trim().toLowerCase();;
    });
    this.getTransaction('');
    this.ngxloader.stop();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.valueChanged.next(filterValue);
  }

  showFilterInput(): void {
    this.isShowFilterInput = !this.isShowFilterInput;
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.getTransaction('');
  }

  // itemMapping = {
  //   1: 'Free',
  //   2: 'Monthly',
  //   3: 'Yearly',
  // }

  getPlanName(data: PlanPurchase) {
    switch (data) {
      case PlanPurchase.FREE:
        return 'Free'
      case PlanPurchase.MONTHLY:
        return 'Monthly'
      case PlanPurchase.HALFYEARLY:
        return 'Half Yearly'
      case PlanPurchase.ANNUAL:
        return 'Annual'
      default:
        return 'Unknown'
    }
  }

  /* Export excel */
  exportToExcel(): void {
    this.ngxloader.start();
    this.dataService.transactionExcel(this.totalItems).subscribe(
      (data) => {
        this.ngxloader.stop();
        let id:number = 0; 
        const updated_data = data.body.items.map((item: Items) => {   
          return {
            ['Sr.no']: id += 1,
            Name: item.users?.name,
            Email: item.users?.email,
            ['Mobile Number']: item.users?.mobileNumber,
            Active: item.isActive,
            Plan: this.getPlanName(item.planId),
            ['Payment Mode']: item.paymentType,
            ['Payment Status']: item.paymentStatus,
            ['Order ID']: item.orderId,
            ['Transaction ID']: item.transactionId,
            ['Payment Date']: moment(item.createdAt).format('LL')
          };
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(updated_data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'transaction.xlsx');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error fetching initial data:', error);
      }
    );
  }

  search(filterValue) {
    const filteredData = {
      page: 1,
      limit: 10,
      q: filterValue,
      sortField: filterValue?.sortField === undefined ? '' : filterValue?.sortField,
      sortValue: filterValue?.sortValue === undefined ? '' : filterValue?.sortValue
    }
    this.dataService.transactionHistory(filteredData).pipe().subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.currentPage = data.body.meta.currentPage;
        this.totalItems = data.body.meta.totalItems;
      });
  }

  currentSort: Sort = {
    active: 'name' || 'amount' || 'isActive' || 'planId' || 'paymentType' || 'createdAt' || 'updatedAt',
    direction: 'asc'
  };

  /*Sorting */
  sortData(): void {
    this.ngxloader.start();
    const data = this.sortList?.slice();
    this.sortList = data;
    this.localSort(this.sort, data);
    this.currentSort = this.sort;
    const sorting = {
      page: 1,
      sortField: this.currentSort?.active,
      sortValue: this.currentSort?.direction.toUpperCase()
    }
    this.getTransaction(sorting);
    this.ngxloader.stop();
    return;
  }

  localSort(sort: Sort, data): void {
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a?.name, b?.name, isAsc);
        case 'planId': return this.compare(a?.planId, b?.planId, isAsc);
        case 'amount': return this.compare(a?.amount, b?.amount, isAsc);
        case 'isActive': return this.compare(a?.isActive, b?.isActive, isAsc);
        case 'paymentType': return this.compare(a?.paymentType, b?.paymentType, isAsc);
        case 'createdAt': return this.compare(a?.createdAt, b?.createdAt, isAsc);
        case 'updatedAt': return this.compare(a?.updatedAt, b?.updatedAt, isAsc);
        default: return 0;
      }
    });
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTransaction(filterValue) {
    const filteredData = {
      page: filterValue.page === undefined ? this.currentPage : filterValue.page,
      limit: this.itemsPerPage,
      q: this.searchKey,
      sortField: filterValue?.sortField === undefined ? '' : filterValue?.sortField,
      sortValue: filterValue?.sortValue === undefined ? '' : filterValue?.sortValue
    }
    this.dataService.transactionHistory(filteredData).subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.currentPage = data.body.meta.currentPage;
        this.totalItems = data.body.meta.totalItems;
        this.sortList = data.body.items;
      }
    );
  }
}
