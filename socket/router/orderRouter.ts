import { Socket } from "socket.io";
import { orderEvent } from "../events/orderEvents";
import { cache } from "../../app";
import {idOrderSchema, orderCreateSchema,ciSchema} from '../middlewares/schemaOrders'
import { validateFields } from "../middlewares/validateSchemas";

export const orderEvents = async(socket:Socket,io:any) => {
    const orderEvents = new orderEvent(socket,io,cache)

 
// Fetch all orders and emit a JSON response with all data
socket.on('client:orders-request', async () => await orderEvents.getOrder());

// Create a new order using orderData.
// Once created, emits 'server:orders-online' to update all orders
// and 'server:upgrade-order' to the specific client with the changes status
// the status that it's created is "En espera"
socket.on('client:order-create', async (orderData) => {
    const error = await validateFields(orderCreateSchema,orderData,socket);
    if(error) return; // stop function
    await orderEvents.createOrder(orderData);
});


// Get orders with a payment status of "Confirmado"
// Emits 'server:order-kitchen' with the relevant orders for kitchen. Its status is "Cocinando"
socket.on('client:orders-kitchen-request', async () => await orderEvents.getOrderKitchen());

// Confirm the reference for a specific order (idOrder)
// Updates the order status to "Cocinando" and payment status to "Confirmado"
// Emits both 'server:order-kitchen' and 'server:upgrade-order' to notify the changes.
socket.on('client:order-confirm-ref', async (idOrder) => {
    const error = await validateFields(idOrderSchema,idOrder,socket);
    if(error) return;
    await orderEvents.confirmRef(idOrder);
 });

// Update an order's status to "En via"
// Emits 'server:upgrade-order' to the affected client with the updates.
socket.on('client:order-kitchen-complete', async (idOrder) => {
    const error = await validateFields(idOrderSchema,idOrder,socket);
    if(error) return;

    await orderEvents.orderToDelivery(idOrder)
});

// Mark an order (idOrder) as "Finalizado"
// Updates its status and emits 'server:upgrade-order' to the specified client.
socket.on('client:order-finished', async (idOrder) => {  
    const error = await validateFields(idOrderSchema,idOrder,socket);
    if(error) return;

    await orderEvents.orderFinished(idOrder);
});

// Handle a client's reconnection (identified by ci).
// Emits 'server:reconnected' to confirm successful reconnection and
// 'server:upgrade-order' to sync the client's state.
socket.on('client:reconnect', async (ci) => {
    const error = await validateFields(ciSchema,ci,socket);
    if(error) return;
    await orderEvents.handleReconnection(ci)
});

};

// all sockets emit 'server-error', listen to this event everytime 