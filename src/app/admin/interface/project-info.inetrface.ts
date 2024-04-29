export interface Items {
    id: number;
    items: string;
    projectName: string;
    userId: number;
    createdAt: string;
    materialData: {
        id: number;
        address: string;
        typeId: number;
        userId: number;
        type: string;
        quantity: number;
        projectId: number;
        name: string;
        orderMaterialId: number;
        liveFileUrl: string;
        angle: string;
        latitude: string;
        longitude: string
    }
}

export interface projectMaterial extends Items {
    types: {
        id: number;
        orderMaterialId: number;
        type: string;
    }
}

export interface projectInfo {
    body: {
        items: Items[];
    }
}