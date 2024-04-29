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
import { Items, qualityAssurance } from '../../interface/qualityAssurance.inetrface';
import { PlanPurchase } from '../../enums/roles.enum';
import * as moment from 'moment';

@Component({
  selector: 'app-quality-assurance',
  templateUrl: './quality-assurance.component.html',
  styleUrls: ['./quality-assurance.component.scss']
})
export class QualityAssuranceComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public displayedColumns = ['id', 'name', 'mobileNumber', 'email', 'planId', 'location', 'plotSize', 'createdAt'];
  public dataSource = new MatTableDataSource();
  public totalItems = 0;
  public itemsPerPage = 10;
  public currentPage = 1;
  public index: number = 0;
  public isShowFilterInput!: boolean
  public searchKey: string = "";
  public sortList
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
    this.qualityAssurance('');
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
    this.qualityAssurance('');
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
    this.dataService.qualityExcel(this.totalItems).subscribe(
      (data) => {
        this.ngxloader.stop();
        let id:number = 0; 
        const updated_data = data.body.items.map((item:Items) => {   
          return {
            ['Sr.no']: id += 1,
            Name: item.users?.name,
            Email: item.users?.email,
            ['Mobile Number']: item.users?.mobileNumber,
            Plan: this.getPlanName(item.users?.planId),
            ['Plot Size sq/ft']: item.plotSize,
            Address:item.location,
            ['Payment Date']: moment(item.createdAt).format('LL')
          };
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(updated_data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'quality.xlsx');
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
    this.dataService.qualityAssurance(filteredData).pipe().subscribe(
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
    this.qualityAssurance(sorting);
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

  qualityAssurance(filterValue) {
    const filteredData = {
      page: filterValue.page === undefined ? this.currentPage : filterValue.page,
      limit: this.itemsPerPage,
      q: this.searchKey,
      sortField: filterValue?.sortField === undefined ? '' : filterValue?.sortField,
      sortValue: filterValue?.sortValue === undefined ? '' : filterValue?.sortValue
    }
    this.dataService.qualityAssurance(filteredData).subscribe(
      (data: qualityAssurance) => {
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
