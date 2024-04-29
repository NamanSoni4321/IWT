import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddComponent } from '../dialog/add/add.component';
import { AuthService } from 'src/app/Auth/auth.service';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { Subject, Subscription, of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { Items, project, createProject } from '../../interface/project.interface';
import { filteredData } from '../../interface/filterData.interface';
import { PageLimit } from '../../enums/roles.enum';
import * as moment from 'moment';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';
import { ToastrService } from 'ngx-toastr';
import { EditComponent } from '../dialog/edit/edit.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'projectName', 'name', 'email', 'mobileNumber', 'address', 'isCompleted', 'createdAt', 'updatedAt', 'actions'];
  public dataSource = new MatTableDataSource<Items>();
  public dataSourceWithPageSize = new MatTableDataSource<Items>()
  public valuechange: Subject<string> = new Subject<string>();
  public totalItems = 0;
  public itemsPerPage = 10;
  public currentPage = 1;
  public isShowFilterInput!: boolean;
  public searchKey: string = '';
  public sortList;
  public Unsubscribe$: Subscription;

  constructor(private dataService: AuthService,
    public dialogService: MatDialog,
    private ngxloader: NgxUiLoaderService,
    public toastr:ToastrService) { }

  ngOnInit() {
    this.ngxloader.start();
    this.getProjectFromBackend({});
    this.valuechange.pipe(debounceTime(500)).subscribe((value) => {
      const filterValue: filteredData = {
        page: PageLimit.Page,
        limit: PageLimit.Limit,
        q: value.trim().toLocaleUpperCase(),
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

  showFilterInput(): void {
    this.isShowFilterInput = !this.isShowFilterInput;
  }

  onPageChange(event) {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.getProjectFromBackend({});
  }

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "450px"
    const dialogRef = this.dialogService.open(AddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.getProjectFromBackend({});
    });
  }

  openEditDialog(items:Items) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "450px"
    dialogConfig.data = { id: items.id, projectName: items.projectName };
    dialogConfig.disableClose = true;
    const dialogRef = this.dialogService.open(EditComponent, dialogConfig);
    
    dialogRef.afterClosed().subscribe(() => {
      this.getProjectFromBackend({});
    });
  }


  deleteProject(item: Items) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      message: ` Are you sure you want to Delete this project?`
    }
    const dialogRef = this.dialogService.open(ConfirmationComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatus.subscribe((data) => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.data = {
        confirm: `Delete this project cannot be undone. Are you sure you want to Delete`
      }
      const dialogRef = this.dialogService.open(ConfirmationComponent, dialogConfig);
      dialogRef.componentInstance.onEmitStatus.subscribe((data) => {
        this.ngxloader.start();
        this.dataService.deleteProject(item.id).subscribe(()=>{
          this.ngxloader.stop();
          this.toastr.success('Project deleted successfully');
        });
      })
      dialogRef.afterClosed().subscribe(() => {
        this.getProjectFromBackend({});
      });
    })
  }

  exportToExcel(): void {
    this.ngxloader.start();
    this.dataService.excelProject(this.totalItems).subscribe(
      (data) => {
        this.ngxloader.stop();
        let id: number = 0;
        const updated_data = data.body.items.map((item: createProject) => {
          return {
            ['Sr.no']: id += 1,
            ['Project Name']: item.projectName,
            ['Customer Name']: item?.users?.name,
            ['Mobile Number']: item?.users?.mobileNumber,
            Email: item?.users?.email,
            Address: item?.users?.address,
            ['Profile Completed']: item?.users?.isCompleted === true ? 'Completed' : 'Not Completed',
            ['Project Created']: moment(item.createdAt).format('LL'),
            ['Project Updated']: moment(item.updatedAt).format('LL'),
          }
        })
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(updated_data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'project.xlsx');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error fetching initial data:', error);
      }
    );
  }

  search(filterValue: filteredData) {
    this.dataService.getProject(filterValue).pipe().subscribe(
      (data) => {
        this.dataSource.data = data.body.items;
        this.currentPage = data.body.meta.currentPage;
        this.totalItems = data.body.meta.totalItems;
      });
  }

  currentSort: Sort = {
    active: 'id' || 'projectName ' || 'name' || 'email' || 'mobileNumber' || 'isCompleted' || 'createdAt' || 'updatedAt',
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
    this.getProjectFromBackend(sorting);
    this.ngxloader.stop();
    return;
  }

  localSort(sort: Sort, data): void {
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'projectName': return this.compare(a?.name, b?.name, isAsc);
        case 'name': return this.compare(a?.name, b?.name, isAsc);
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

  getProjectFromBackend(filterValue: filteredData) {
    const filteredData = {
      page: filterValue.page === undefined ? this.currentPage : filterValue.page,
      limit: this.itemsPerPage,
      q: this.searchKey,
      sortField: filterValue?.sortField === undefined ? '' : filterValue?.sortField,
      sortValue: filterValue?.sortValue === undefined ? '' : filterValue?.sortValue
    }
    this.Unsubscribe$ = this.dataService.getProject(filteredData).pipe(
      catchError((error) => {
        console.error('Error fetching data:', error);
        return of([]);
      })).subscribe(
        (data: project) => {
          this.dataSource.data = data.body.items;
          this.sortList = data.body.items;
          this.totalItems = data.body.meta.totalItems;
        }
      );
  }

  ngOnDestroy(): void {
    this.Unsubscribe$.unsubscribe();
  }
}
