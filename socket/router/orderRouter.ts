import { Socket } from "socket.io";
import { orderEvent } from "../events/orderEvents";
import NodeCache from "node-cache";
import { cache } from "../../app";

export const orderEvents = async(socket:Socket,io:any) => {
    const orderEvents = new orderEvent(socket,io,cache)

    socket.on('client:order-request', async () =>  await orderEvents.getOrder() );

    socket.on('client:order-create', async (orderData) =>  { 
        
        await orderEvents.createOrder(orderData);
    }
     );

    socket.on('client:order-kitchen', async () => await orderEvents.getOrderKitchen());

    socket.on('client:order-confirm-ref', async (idOrder) => await orderEvents.confirmRef(idOrder));

    socket.on('client:order-kitchen-complete', async (idOrder) => await orderEvents.orderToDelivery(idOrder))

    socket.on('client:order-finished', async (idOrder) => await orderEvents.orderFinished(idOrder))

    socket.on('client:reconnect', async (ci) => await orderEvents.handleReconnection(ci));

};