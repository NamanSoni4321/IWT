import { Meta, Users } from "./qualityAssurance.inetrface";

export interface Items extends Users{
    id:number;
    amount:number;
    isActive:boolean;
    orderId:string;
    paymentStatus:string;
    paymentType:string;
    planId:number;
    transactionId:string;
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

export interface Transaction {
    body: {
        items: Items[];
        meta: Meta;
      };
}