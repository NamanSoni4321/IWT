import { Meta } from "./qualityAssurance.inetrface";

export interface ItemNamesMapping {
    [key:number] : string;
}

export interface materialData{
    materialData:string;
}

export interface Items {
    id:number;
    name:string;
    projectName:string;
    email:string;
    mobileNumber:number;    
    address:string;
    items:{};
    assignUser:string;
    userId:number;
    isEnable:boolean;
    planId:number;
    isCompleted:boolean;
    createdAt:string;
    updatedAt:string;
}

export interface project {
    body:{
        items:Items[];
        meta:Meta;
    }
}

export interface createProject {
    id?:number;
    projectName?:string;
    items?;
    userId?:number;
    assignUser?:string;
    isEnable?:boolean;
    planId?:number;
    createdAt?:string;
    updatedAt?:string;
    users?:{
        name:string;
        mobileNumber:number;
        email:string;
        address:string;
        isCompleted:boolean;
    }
}