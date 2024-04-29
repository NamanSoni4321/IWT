export interface dashboard{
    body:{
        amount:number;
        completed:number;
        notCompleted:number;
        plans:number;
        projects:number;
        users:number;
        monthProject:{
            count:string;
            month:number;
        };
        monthUser:{
            count:string;
            month:number;
        }
    }
}