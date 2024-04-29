
import { Meta, Users } from "./qualityAssurance.inetrface";

export interface Items extends Users{
    plan:string;
    plotSize:string;
    start:string;
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

export interface hireUs {
    body: {
        items: Items[];
        meta: Meta;
      };
}