import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { login } from "../admin/interface/login.interface";
import { video } from "../admin/interface/video.interface";
import { customer, getCustomer } from "../admin/interface/customer.interface";
import { Items, createProject, project } from "../admin/interface/project.interface";
import { token } from "../admin/interface/token.interface";
import { password } from "../admin/interface/profile.interface";
import { material } from "../admin/interface/material.interface";
import { filteredData } from "../admin/interface/filterData.interface";
import { qualityAssurance } from "../admin/interface/qualityAssurance.inetrface";
import { Transaction } from "../admin/interface/transaction.interface";
import { plan } from "../admin/interface/plan.interface";
import { hireUs } from "../admin/interface/hireUs.interface";
import { dashboard } from "../admin/interface/dashboard.interface";
import { ApiResponse } from "../admin/interface/ApiResponse.interface";
import { getMessaging, message, notification } from "../admin/interface/notification.interface";
import { Material } from "../admin/interface/save-material.interface";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(public http: HttpClient) { }

  /* Header function */
  getHeaders() {
    let token = localStorage.getItem("token");
    let headers = new HttpHeaders({ Authorization: "Bearer " + token });
    let options = {
      headers: headers,
      observe: "response" as "body",
    };
    return options;
  }

  /* Login with token  */
  login(login: login): Observable<ApiResponse> {
    return this.http
      .post<login>(`/api/auth/login`, login, this.getHeaders()).pipe(
        map((res: ApiResponse) => {
          this.setItem("user", JSON.stringify(res.body));
          this.setItem("token", res.body.token);
          return res.body;;
        })
      );
  }

  /* Forgot password */
  forgotPassword(item: password): Observable<password> {
    return this.http.post(`/api/admin/forget-password`, item, this.getHeaders())
      .pipe(map((res: HttpResponse<password>) => {
        return res.body;
      }))
  }

  /* Add a new plan */
  createPlan(item: plan): Observable<plan> {
    return this.http.post(`/api/plan`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<plan>) => {
          return res.body;
        })
      );
  }

  /* Update a plan   */
  updatePlan(item: plan): Observable<plan> {
    return this.http.patch(`/api/plan`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<plan>) => {
          return res.body;
        })
      );
  }

  
  /* Update a status of plan   */
  updateStatus(item: plan): Observable<plan> {
    return this.http.patch(`/api/plan/update-status`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<plan>) => {
          return res.body;
        })
      );
  }

  /*  Delete a plan  */
  delete(id: number): Observable<plan> {
    return this.http.delete(`/api/plan/${id}`, this.getHeaders())
      .pipe(
        map((res: HttpResponse<plan>) => {
          return res.body;
        })
      );
  }

  /*  Get list of a plan  */
  getPlan(e: filteredData): Observable<plan> {
    return this.http.get<plan>(`/api/plan?page=${e.page}&limit=${e.limit}&q=${e.q}&sortField=${e?.sortField}&sortValue=${e?.sortValue}`, this.getHeaders());
  }

  /* Get customers  */
  getCustomer(e: filteredData): Observable<getCustomer> {
    return this.http.get<getCustomer>(`/api/users?page=${e.page}&limit=${e.limit}&q=${e.q}&sortField=${e?.sortField}&sortValue=${e?.sortValue}`, this.getHeaders());
  }

  /*   Add a new Customer  */
  addCustomer(item: customer): Observable<customer> {
    return this.http.post(`/api/users`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<customer>) => {
          return res.body;
        })
      );
  }

  /* Update a customer  */
  customerUpdate(item: customer,): Observable<customer> {
    return this.http.patch(`/api/users`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<customer>) => {
          return res.body;
        })
      );
  }

  /* Update a customer status */
  updateCustomerStatus(item: customer, status: boolean): Observable<customer> {
    const id = item.id;
    const payload = { status, id };
    return this.http.patch(`/api/users`, payload, this.getHeaders())
      .pipe(
        map((res: HttpResponse<customer>) => {
          return res.body;
        })
      );
  }

  /*   update mobile number   */
  numberUpdate(item: customer): Observable<customer> {
    return this.http.post(`/api/auth/user-login`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<customer>) => {
          return res.body;
        })
      );
  }

  /* Delete the customer  */
  deleteCustomer(id: number): Observable<customer> {
    return this.http.delete(`/api/users/${id}`, this.getHeaders()).pipe(
      map((res: HttpResponse<customer>) => {
        return res.body;
      })
    );
  }

  /*     Get the project     */
  getProject(e: filteredData): Observable<project> {
    return this.http.get<project>(`/api/create-project?page=${e.page}&limit=${e.limit}&q=${e.q}&sortField=${e.sortField}&sortValue=${e.sortValue}`, this.getHeaders());
  }

  /*  Select customer to create project  */
  getCustomerProject(e: filteredData): Observable<project> {
    return this.http.get<project>(`/api/users?page=${e.page}&limit=${e.limit}`, this.getHeaders());
  }

  /*  Create project  */
  projectCustomer(item: createProject): Observable<project> {
    return this.http.post(`/api/create-project`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<project>) => {
          return res.body;
        })
      );
  }

    /*  Edit project  */
  projectUpdate(item:createProject): Observable<createProject> {
    return this.http.patch(`/api/create-project`, item, this.getHeaders())
      .pipe(
        map((res: HttpResponse<createProject>) => {
          return res.body;
        })
      );
  }

  /* Delete project*/ 
deleteProject(id:number):Observable<createProject>{
  return this.http.delete(`api/create-project/${id}`,this.getHeaders()).pipe(
    map((res: HttpResponse<createProject>)=>{
      return res.body;
    })
  )
}
  /*  get the project info by id */
  getProjectById(id:number): Observable<Items> {
    return this.http.get(`/api/material/project-id/${id}`, this.getHeaders())
      .pipe(map((res: HttpResponse<Items>) => res.body));
  }

  /* getUpdatedList */
  getUpdatedList(id: number): Observable<Material[]> {
    return this.http.get(`/api/material/user-id/${id}`, this.getHeaders())
      .pipe(map((res: HttpResponse<Material[]>) => res.body));
  }

  /*  save Material Entry  */
  saveMaterialEntry(formData): Observable<any> {
    return this.http.post("http://103.186.184.179:3002/api/material", formData, this.getHeaders()).pipe(
      map((res: HttpResponse<any>) => {
        return res.body;
      })
    );
  }

  /* getInitialData of customers showing in dashboard  */
  exportCustomer(item: number): Observable<getCustomer> {
    return this.http.get<getCustomer>(`/api/users?limit=${item}`, this.getHeaders())
  }

  /* getInitialData of plan showing in dashboard  */
  excelPlan(item: number): Observable<plan> {
    return this.http.get<plan>(`/api/plan?limit=${item}`, this.getHeaders());
  }

  /*  getInitialData of project showing in dashboard */
  excelProject(item: number): Observable<project> {
    return this.http.get<project>(`/api/create-project?limit=${item}`, this.getHeaders());
  }

  /*transactionExcel  */
  transactionExcel(item: number): Observable<Transaction> {
    return this.http.get<Transaction>(`/api/transaction/total-transaction-info?limit=${item}`, this.getHeaders());
  }

  /*hireExcel  */
  hireExcel(item: number): Observable<hireUs> {
    return this.http.get<hireUs>(`/api/hire-us?limit=${item}`, this.getHeaders());
  }

  /*qualityExcel  */
  qualityExcel(item: number): Observable<qualityAssurance> {
    return this.http.get<qualityAssurance>(`/api/quality-assurance?limit=${item}`, this.getHeaders());
  }

  /* dashboard API */
  dashboard(): Observable<dashboard> {
    return this.http.get<dashboard>(`/api/users/dashboard-api`, this.getHeaders())
  }

  /* Transaction history */
  transactionHistory(e: filteredData): Observable<Transaction> {
    return this.http.get<Transaction>(`/api/transaction/total-transaction-info?page=${e.page}&limit=${e.limit}&q=${e.q}&sortField=${e.sortField}&sortValue=${e.sortValue}`, this.getHeaders())
  }

  /* Hire US */
  hireUs(e: filteredData): Observable<hireUs> {
    return this.http.get<hireUs>(`/api/hire-us?page=${e.page}&limit=${e.limit}&q=${e.q}&sortField=${e.sortField}&sortValue=${e.sortValue}`, this.getHeaders());
  }

  /* Quality Assurance */
  qualityAssurance(e: filteredData): Observable<qualityAssurance> {
    return this.http.get<qualityAssurance>(`/api/quality-assurance?page=${e.page}&limit=${e.limit}&q=${e.q}&sortField=${e.sortField}&sortValue=${e.sortValue}`, this.getHeaders());
  }

  /* upload video */
  uploadVideo(videoValue): Observable<video> {
    return this.http.patch(`http://103.186.184.179:3002/api/settings`, videoValue, this.getHeaders()).pipe(
      map((res: HttpResponse<video>) => {
        return res.body;
      })
    );
  }

  /* update Material */
  updateMaterial(value: material): Observable<material> {
    return this.http.patch(`/api/settings`, value, this.getHeaders()).pipe(
      map((res: HttpResponse<material>) => {
        return res.body;
      })
    );
  }

  /*Change Password */
  changePassword(value: password): Observable<password> {
    return this.http.patch(`/api/admin`, value, this.getHeaders()).pipe(
      map((res: HttpResponse<password>) => {
        return res.body;
      })
    );
  }

  /* Response video*/
  getVideo(): Observable<video> {
    return this.http.get<video>(`/api/settings/all-info`, this.getHeaders());
  }

  /* firebaseToken */
  firebaseToken(token: token): Observable<token> {
    return this.http.patch(`/api/admin/update-token`, token, this.getHeaders()).pipe(
      map((res: HttpResponse<token>) => {
        return res.body
      })
    );
  }

  /* Get all notification */
  getNotification(): Observable<message>{
    return this.http.get(`/api/notification/all-notification`,this.getHeaders()).pipe(
      map((res: HttpResponse<getMessaging>) =>{
        return res.body
      })
    )
  }

  /* Read notification */
  notify(item:notification): Observable<notification>{
    return this.http.patch(`/api/notification/admin-notification`,item,this.getHeaders()).pipe(
      map((res: HttpResponse<notification>) =>{
        return res.body
      })
    )
  }

  /*   set local storage  */
  private setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
