export interface notification {
    id?: number;
    msg?: string;
    status?: boolean;
    title?: string;
    createdAt?: string;
}

export interface message {
    adminNotification: [notification];
    count: number;
}

export interface getMessaging extends message {
    body: {
        adminNotification: [notification];
        count: number;
    }
}