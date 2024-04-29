export interface Material {
    address: string;
    angle: string;
    createdAt: string;
    deletedAt: string | null;
    id: number;
    latitude: string;
    liveFileUrl: string;
    longitude: string;
    orderMaterialId: number;
    projectId: number;
    quantity: number;
    typeId: number;
    updatedAt: string;
    userId: number;
    type?:MaterialType;
}

export interface MaterialType {
    createdAt: string;
    deletedAt: string | null;
    id: number;
    orderMaterialId: number;
    type: string;
    updatedAt: string;
}

export interface saveMaterial {
    body:{
    items: Material[];
}
  }