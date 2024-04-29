import { Meta } from "./qualityAssurance.inetrface";

export interface Items {
    id?: number;
    name?: string;
    price?: number;
    status?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface plan extends Items {
    body?: {
        items: Items[];
        meta: Meta;
    }
}
