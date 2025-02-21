import { Socket } from "socket.io";
import { DishEvents } from "../events/dishEvents";

export const dishRequest = async(socket:Socket,io:any) => {
    const dishEvent = new DishEvents(socket,io)

    socket.on('client:requestDish', async () =>  await dishEvent.emitAllDish() ) 

    socket.on('client:dish_create', async(data) => { 
        await dishEvent.emitCreate(data.name, data.price, data.description, data.amount, data.category, data.img);
    })

} 
