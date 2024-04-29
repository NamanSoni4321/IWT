import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AddComponent } from '../dialog/add/add.component';
import { AuthService } from 'src/app/Auth/auth.service';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription, of } from 'rxjs';
import { EditComponent } from '../dialog/edit/edit.component';
import { MatDialogConfig } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { filteredData } from '../../interface/filterData.interface';
import { Items, plan } from '../../interface/plan.interface';
import { PageLimit } from '../../enums/roles.enum';
import * as moment from 'moment';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';

class NavLink {
  constructor(public path: string, public label: string) { }
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'name', 'price', 'createdAt', 'updatedAt', 'status', 'actions'];
  public dataSource = new MatTableDataSource<Items>();
  public dataSourceWithPageSize = new MatTableDataSource<Items>();
  public totalItems = 0;
  public itemsPerPage = 10;
  public currentPage = 1;
  public valuechange: Subject<string> = new Subject<string>();
  public isShowFilterInput = false;
  public searchKey: string = '';
  public sortList;
  public Unsubscribe$: Subscription

  constructor(private readonly dataService: AuthService,
    public dialogService: MatDialog,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxloader.start();
    this.getDataFromBackend({});
    this.valuechange.pipe(debounceTime(500)).subscribe((value) => {
      const filterValue = {
        page: PageLimit.Page,
        limit: PageLimit.Limit,
        q: value.trim().toLocaleLowerCase(),
        sortField: '',
        sortValue: ''
      }
      this.search(filterValue);
      this.searchKey = filterValue.q;
    })
    this.ngxloader.stop();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.valuechange.next(filterValue);
  }

  onPageChange(event) {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.getDataFromBackend({});
  }

  toggleStatus(items: plan) {
    this.ngxloader.start();
    const item = items
    item.status = !items?.status;
    this.dataService.updateStatus(item).subscribe((data: plan) => {
      this.ngxloader.stop();
      data.status = item?.status;
    }, (error) => {
      this.ngxloader.stop();
      this.toastr.error("Please try again later", "Plan currently active")
      console.log("Error updating plan status", error);
      this.getDataFromBackend({})
    })
  }

  public showFilterInput(): void {
    this.isShowFilterInput = !this.isShowFilterInput;
  }

  exportToExcel(): void {
    this.ngxloader.start();
    this.dataService.excelPlan(this.totalItems).subscribe(
      (data) => {
        this.ngxloader.stop();
        let id: number = 0;
        const updated_data = data.body.items.map((item) => {
          return {
            ['Sr.no']: id += 1,
            Name: item.name,
            Price: item.price,
            Active: item.status,
            ['Plan Created']: moment(item.createdAt).format("LL"),
            ['Plan Upadted']: moment(item.updatedAt).format("LL"),
          }
        })
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(updated_data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'plan.xlsx');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error fetching initial data:', error);
      }
    );
  }

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "450px";
    dialogConfig.disableClose = true;
    const dialogRef = this.dialogService.open(AddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.getDataFromBackend({});
    });
  }

  openEditDialog(items: plan) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "450px";
    dialogConfig.data = { id: items.id, name: items.name, price: items.price };
    dialogConfig.disableClose = true;
    const dialogRef = this.dialogService.open(EditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.getDataFromBackend({});
    });
  }

  deletePlan(items: plan) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      message: `Are you sure want to Delete this plan ?`
    }
    const dialogRef = this.dialogService.open(ConfirmationComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatus.subscribe((data) => {
      this.ngxloader.start();
      this.dataService.delete(items.id).subscribe(
        (response) => {
          this.ngxloader.stop();
          this.toastr.success('Delete Successfully');
        },
        (error) => {
          this.ngxloader.stop();
          console.error('Error posting data:', error);
          if (error && error.error) {
            this.toastr.error('Please try again later', 'Plan currently in use')
          } else {
            this.toastr.error('An error occurred while fetching data.', 'Error');
          }
        }
      )
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getDataFromBackend({});
    });
  }

  search(filterValue: filteredData) {
    this.dataService.getPlan(filterValue).pipe().subscribe((data) => {
      this.dataSource.data = data.body.items;
      this.currentPage = data.body.meta.currentPage;
      this.totalItems = data.body.meta.totalItems;
    });
  }

  /* Sorting */
  currentSort: Sort = {
    active: 'id' || 'name' || 'price' || 'status' || 'createdAt' || 'updatedAt',
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
    this.getDataFromBackend(sorting);
    this.ngxloader.stop();
    return;
  }

  localSort(sort: Sort, data): void {
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a?.name, b?.name, isAsc);
        case 'price': return this.compare(a?.price, b?.price, isAsc);
        case 'status': return this.compare(a?.status, b?.status, isAsc);
        case 'createdAt': return this.compare(a?.createdAt, b?.createdAt, isAsc);
        case 'updatedAt': return this.compare(a?.updatedAt, b?.updatedAt, isAsc);
        default: return 0;
      }
    });
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getDataFromBackend(e: filteredData) {
    const filteredData = {
      page: e.page === undefined ? this.currentPage : e.page,
      limit: this.itemsPerPage,
      q: this.searchKey,
      sortField: e?.sortField === undefined ? '' : e?.sortField,
      sortValue: e?.sortValue === undefined ? '' : e?.sortValue
    }
    this.Unsubscribe$ = this.dataService.getPlan(filteredData).subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.sortList = data.body.items;
        this.totalItems = data.body.meta.totalItems;
        this.currentPage = data.body.meta.currentPage;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.Unsubscribe$.unsubscribe();
  }
}