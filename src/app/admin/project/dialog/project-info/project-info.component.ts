import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/Auth/auth.service';
import { ItemNamesMapping, Items, createProject, materialData } from 'src/app/admin/interface/project.interface';
import * as XLSX from 'xlsx';
import * as moment from 'moment';

@Component({
  selector: 'app-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss']
})
export class ProjectInfoComponent implements OnInit, AfterViewInit {
  public displayedColumns = ['id', 'orderMaterialId', 'quantity', 'address', 'liveFileUrl', 'createdAt'];
  public dataSource = new MatTableDataSource();
  public id: number;
  public projectName: string;
  public materialId: number[];
  public materialData;
  public noDataFound!: boolean;

  @ViewChild(MatSort) sort: MatSort;
  constructor(private route: ActivatedRoute,
    private dataService: AuthService,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) { }

  ngAfterViewInit() {
    this.ngxloader.start();
    this.dataSource.sort = this.sort;
    this.ngxloader.stop();
  }

  ngOnInit(): void {
    this.ngxloader.start();
    this.id = this.route.snapshot.params['id'];
    this.getProjectInfo();
    this.getUpdatedList();
    this.ngxloader.stop();
  }

  itemNamesMapping: ItemNamesMapping = {
    1: 'Cement',
    2: 'Reti',
    3: 'Brick',
    4: 'Steel',
    5: 'Concrete mix'
  };


  exportToExcel(): void {
    this.ngxloader.start();
    this.dataService.getUpdatedList(this.id).subscribe(
      (data) => {
        this.ngxloader.stop();
        let id:number = 0;
        const update_data = data.map((item)=>{
          return {
            id:id+=1,
            Material:this.itemNamesMapping[item.orderMaterialId],
            Quantity:item.quantity,
            Type:item.type?.type,
            Address:item.address,
            ImageURL:item.liveFileUrl,
            Date:moment(item.createdAt).format('LLLL'),
          }
        })       
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(update_data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'Material.xlsx');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error fetching initial data:', error);
      }
    );
  }

  /*Get  data from Backend */
  getProjectInfo() {
    this.dataService.getProjectById(this.id).subscribe((data:createProject) => {
      if (data && data.projectName) {        
        this.projectName = data.projectName;
        this.materialId = JSON.parse(data.items).filter(item => !isNaN(item));
        this.materialData = data
      }
    }),
      catchError((error) => {
        console.error('Error fetching data:', error);
        return of([]);
      })
    
  }

  /* Get project updated list  */
  getUpdatedList() {
    this.dataService.getUpdatedList(this.id).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    ).subscribe((data) => {
      if (data.length === 0) {
        this.noDataFound = true;
      } else {
        this.dataSource.data = data;
      }})
  }
}
