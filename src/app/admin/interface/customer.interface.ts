import { Meta } from "./qualityAssurance.inetrface";

export interface customer {
    id?: number;
    name?: string;
    email?: string;
    mobileNumber?: number;
    role?: number;
    status?: boolean;
    isCompleted?: boolean;
    address?: string;
    createdAt?:string;
    updatedAt?:string;
}

export interface Items extends customer {

}

export interface getCustomer {
    body: {
        items: Items[];
        meta: Meta
    }
}