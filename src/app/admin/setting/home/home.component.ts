import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/Auth/auth.service';
import { atLeastOneFieldValidator } from './custom-validator';
import { video } from '../../interface/video.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('videoTitle') videoTitle: ElementRef;
  @ViewChild('videoPlayer') videoplayer: ElementRef;

  public videoUrl: string = "";
  public url: string | ArrayBuffer;
  public format: string;
  public fileInput: HTMLInputElement;
  public id: string | Blob;
  public videoId: number;
  public videoSelected!: boolean;
  public Unsubscribe: Subscription

  constructor(private dataService: AuthService,
    private ngxloader: NgxUiLoaderService,
    private toastr: ToastrService,
    private router: Router,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer) {
    this.getVideo();
  }

  ngOnInit(): void {
    this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
  }

  materialForm: FormGroup = this.fb.group({
    material1: ['', [Validators.maxLength(30)]],
    material2: ['', [Validators.maxLength(30)]],
    material3: ['', [Validators.maxLength(30)]],
  }, {
    validator: atLeastOneFieldValidator(),
  });

  toggleVideo(event) {
    this.videoplayer.nativeElement.play();
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.videoSelected = true;
      const files = event.target.files;
      if (files) {
        for (const file of files) {
          if (file.type.indexOf('video') > -1) {
            this.format = 'video';
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            this.url = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  onSubmit() {
    this.ngxloader.start();
    const values = [];
    if (this.materialForm.value.material1)
      values.push(this.materialForm.value.material1);
    if (this.materialForm.value.material2)
      values.push(this.materialForm.value.material2);
    if (this.materialForm.value.material3)
      values.push(this.materialForm.value.material3);
    const items = {
      id: this.videoId,
      value: values
    };
    this.Unsubscribe = this.dataService.updateMaterial(items).pipe(
      catchError((error) => {
        this.ngxloader.stop();
        this.toastr.error('Error occurred while uploading. Please try again')
        this.materialForm.reset();
        return of([]);
      })
    ).subscribe((response) => {
      this.ngxloader.stop();
      this.toastr.success('Material updated successfully')
      this.materialForm.reset();
    });
  }


  uploadFiles() {
    const formData = new FormData();
    formData.append("name", "video");
    const file = (document.getElementById('fileInput') as HTMLInputElement).files[0];
    if (file) {
      this.ngxloader.start();
      formData.append("id", this.id)
      formData.append("value", file);
      this.Unsubscribe = this.dataService.uploadVideo(formData).pipe(
        catchError((error) => {
          this.ngxloader.stop();
          console.error(error);
          this.toastr.error('Error occurred while uploading. Please try again')
          return of([]);
        })
      ).subscribe((response) => {
        this.ngxloader.stop();
        this.toastr.success('video uploaded successfully')
      });
    }
    else {
      this.toastr.warning('Please select a video to upload');
      this.ngxloader.stop();
    }
  }

  getVideo() {
    this.dataService.getVideo().subscribe((response) => {
      this.videoUrl = response.body[0].value.replace(/"/g, '');
      this.id = response.body[0].id;
      this.videoId = response.body[1].id;
      const materials = JSON.parse(response.body[1].value);
      this.materialForm.patchValue({
        material1: materials[0],
        material2: materials[1],
        material3: materials[2]
      });
    })
  }

  ngOnDestroy(): void {
    this.Unsubscribe?.unsubscribe();
  }
}