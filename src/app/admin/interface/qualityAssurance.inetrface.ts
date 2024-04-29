export interface Items extends Users{
    id:number;
    location:string;
    plotSize:string;
    userId:number;
    createdAt:string;
    users?:{
        name:string;
        mobileNumber:number;
        email:string;
        address:string;
        isCompleted:boolean;
        planId?:number;
    }
}

export interface Users {
    name:string;
    mobileNumber:number;
    email:string
    address?:string;
    planId?:number;
}

export interface Meta {
    currentPage:number;
    itemCount:number;
    itemsPerPage:number;
    totalItems:number;
    totalPages:number;
}

export interface qualityAssurance {
    body: {
        items: Items[];
        meta: Meta;
      };
}