
export interface Service {
    _id:string;
    name:string;
    description:string;
    image?:string;
    isActive:boolean;
    createdAt:Date;
}