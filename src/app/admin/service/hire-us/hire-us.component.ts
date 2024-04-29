import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/Auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PlanPurchase } from '../../enums/roles.enum';
import * as moment from 'moment';
import { Items } from '../../interface/hireUs.interface';

@Component({
  selector: 'app-hire-us',
  templateUrl: './hire-us.component.html',
  styleUrls: ['./hire-us.component.scss']
})
export class HireUsComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public displayedColumns = ['id', 'name', 'mobileNumber', 'email', 'address', 'planId', 'plan', 'plotSize', 'start', 'createdAt'];
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
    this.hireUs('');
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
    this.hireUs('');
  }
  
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

  exportToExcel(): void {
    this.ngxloader.start();
    this.dataService.hireExcel(this.totalItems).subscribe(
      (data) => {
        this.ngxloader.stop();
        let id:number = 0; 
        const updated_data = data.body.items.map((item: Items) => {   
          return {
            ['Sr.no']: id += 1,
            Name: item.users?.name,
            Email: item.users?.email,
            ['Mobile Number']: item.users?.mobileNumber,
            Plan: this.getPlanName(item.users?.planId),
            ['Plan sq/ft']: item.plan,
            ['Plot Size sq/ft']: item.plotSize,
            ['Plan to start']: item.start,
            ['Payment Date']: moment(item.createdAt).format('LL')
          };
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(updated_data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'hire-us.xlsx');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error fetching initial data:', error);
      }
    );
  }

  /* Search  */
  search(filterValue) {
    const filteredData = {
      page: 1,
      limit: 10,
      q: filterValue,
      sortField: filterValue?.sortField === undefined ? '' : filterValue?.sortField,
      sortValue: filterValue?.sortValue === undefined ? '' : filterValue?.sortValue
    }
    this.dataService.hireUs(filteredData).pipe().subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.currentPage = data.body.meta.currentPage;
        this.totalItems = data.body.meta.totalItems;
      });
  }

  currentSort: Sort = {
    active: 'name' || 'planId' || 'plan' || 'plotSize' || 'start' || 'createdAt' || 'updatedAt',
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
      page: 1,
      sortField: this.currentSort?.active,
      sortValue: this.currentSort?.direction.toUpperCase()
    }
    this.hireUs(sorting);
    this.ngxloader.stop();
    return;
  }

  localSort(sort: Sort, data): void {
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a?.name, b?.name, isAsc);
        case 'planId': return this.compare(a?.planId, b?.planId, isAsc);
        case 'plan': return this.compare(a?.plan, b?.plan, isAsc);
        case 'plotSize': return this.compare(a?.plotSize, b?.plotSize, isAsc);
        case 'start': return this.compare(a?.start, b?.start, isAsc);
        case 'createdAt': return this.compare(a?.createdAt, b?.createdAt, isAsc);
        case 'updatedAt': return this.compare(a?.updatedAt, b?.updatedAt, isAsc);
        default: return 0;
      }
    });
  }


  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }


  hireUs(filterValue) {
    const filteredData = {
      page: filterValue.page === undefined ? this.currentPage : filterValue.page,
      limit: this.itemsPerPage,
      q: this.searchKey,
      sortField: filterValue?.sortField === undefined ? '' : filterValue?.sortField,
      sortValue: filterValue?.sortValue === undefined ? '' : filterValue?.sortValue
    }
    this.dataService.hireUs(filteredData).subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.currentPage = data.body.meta.currentPage;
        this.totalItems = data.body.meta.totalItems;
        this.sortList = data.body.items;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

}
