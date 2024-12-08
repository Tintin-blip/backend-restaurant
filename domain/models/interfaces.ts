import { order_dish } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export  interface User { 
    ci:number,
    name:string,
    password:string,
    rol:string
}

export interface signIn  { 
    name:string,
    password:string,
}

export interface Dish { 
    id?:number,
    name:string,
    price:number,
    description:string,
    amount:number,
    category:string,
    img?:string
}

export interface DishEdit {
    name:string,
    price:number,
    description:string,
    amount:number,
    category:string,
    img?:string
}
export interface OrderDish{
    dish?: {
        name?: string | null;
        price?: Decimal | null;
    }  | null
}
export interface DishSummary {
    name: string;
    quantity: number;
    price: number;
  }


export interface OrderOnline { 
    id?:number
    date?:Date,
    status?:string | undefined
    clients_online?: ClientOnline 
    order_type?:string
    ci?:number
    order_dish?:DishSummary[];
    total_price?:Number;
}
export interface ClientOnline { 
    tlf:number,
    address:string
}
