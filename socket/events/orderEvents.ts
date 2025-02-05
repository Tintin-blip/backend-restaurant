import { Socket } from "socket.io";
import { OrderHelper } from "../helpers/orderHelpers";
import { DishHelper } from "../../domain/helpers/dishHelpers";
import NodeCache from "node-cache";

export class OrderEvent { 
    private orderHelper;
    private socket:Socket;
    private io;
    private dishHelper:DishHelper
    private cache:NodeCache
    

    constructor(socket:any,io:any,cache:NodeCache) {
        this.cache = cache;
        this.orderHelper = new OrderHelper(this.cache);
        this.socket  = socket;
        this.io = io;
        this.dishHelper = new DishHelper()
    }

    public async getOrder() { 
        try{ 
        const order =  await this.orderHelper.orderSelectFic();
       this.io.emit('server:orders-online',order)
        }catch(err) {
        console.error(err);
        this.socket.emit('server:error', 'Error al obtener la lista de usuarios');
        
        }

    }

    public async getOrderKitchen() { 
        try{
            const orders = await this.orderHelper.orderKitchen();
            this.io.emit("server:orders-kitchen",orders);

         }catch(err) { 
            console.error(err);
            this.socket.emit('server:error', 'Error al obtener');
        
        }
    }
    public async getOrderDelivery() { 
        try{
            const orders = await this.orderHelper.ordersSelectDelivery();
            this.io.emit("server:orders-delivery",orders);

         }catch(err) { 
            console.error(err);
            this.socket.emit('server:error', 'Error al obtener');
        
        }
    }

    public async confirmRef(orderData:{idOrder:number}) { 
        try{
            const {idOrder} =  orderData    
            console.log('El socket (admin)',this.socket.id,'va a verificar el ref del id',idOrder)
            await this.orderHelper.verifyRef(idOrder);
            await this.getOrderKitchen();
            await this.getOrder();
            await this.orderUpdateStatusToClient(idOrder);
         }catch(err) { 
            console.error(err);
            this.socket.emit('server:error', 'Error al obtener');
        
        }
    }

    public async createOrder(orderData:any) { 
        try { 
            const socket_id = this.socket.id
        const orderDishToArray = orderData.order_dish.map((data:any) =>  { 
            return data.id_dish
        })
        
        const orderWithDish = orderData.order_dish.map((data:any) => (  { 
            id_dish:data.id_dish,
            amount:data.amount
        }))

        const currentAmount = await this.dishHelper.getAmountDishToId(orderDishToArray) 
        
            if(!currentAmount) { 
                throw new Error('Error')
            }
         
        const verifyAmount = verifyAmountAvailable(currentAmount,orderWithDish)
    
            if(verifyAmount.length >= 1) { 
            return this.socket.emit('server:error',{status:400,error:`Los siguientes platos no estan disponibles:${verifyAmount}`})
            }
        
        
        const order_id = await this.orderHelper.createOrderOnline(orderData);
        if(!order_id.id) { 
            throw new Error('order_id is not available')
        }
        await this.dishHelper.subtractAmountDish(orderWithDish);

        this.cache.set(order_id.id,socket_id);

        console.log(`El socket ${socket_id},(cliente), creo una orden con el id ${order_id.id} y se guardo en cache el socket`)
        await this.orderUpdateStatusToClient(order_id.id);
        await this.getOrder();
        }catch(err) {
            console.error(err);
            this.socket.emit('server:error',{status:400,error:err});

        }
    }
    
    public async orderUpdateStatusToClient(idOrder:number) { 
        try{

            const order = await this.orderHelper.orderClientOnline(idOrder);
            const socket_id = this.cache.get(idOrder);
            if (typeof socket_id !== 'string') {
                throw new Error('Socket ID is not available or invalid');
            }
            this.io.to(socket_id).emit("server:upgrade-order",order);
            console.log(`Se detecto un cambio en una orden con id ${idOrder}, pertenece al socket ${socket_id}, se enviaran los cambios: ${order}`)
         }catch(err) {
            console.error(err)
            this.socket.emit('server:error',{status:400,error:err});

        }
    }

    public async orderToDelivery(orderData: {idOrder:number}) { 
        try { 
            const {idOrder} = orderData
            await this.orderHelper.updateOrderStatusToDelivery(idOrder);
            await this.orderUpdateStatusToClient(idOrder);
            await this.getOrderDelivery();
            await this.getOrder();

        }catch(err) {
            console.error(err)
            this.socket.emit('server:error',{status:400,error:err});

        }
    }

    public async orderFinished(orderData:{idOrder:number}) { 
        try { 
            const {idOrder} = orderData
            await this.orderHelper.updateOrderToFinished(idOrder);
            await this.orderUpdateStatusToClient(idOrder);
            await this.getOrder();
            this.cache.del(idOrder)

        }catch(err) {
            console.error(err)
            this.socket.emit('server:error',{status:400,error:err});

        }
    }

    public async handleReconnection(ci:{ci:number}):Promise <void> { 
        
        try { 
            const socket_id = this.socket.id
            
            const order = await this.orderHelper.getIdOrderByCiWithStatus(ci.ci);

            console.log(order)
            if(!order || order == undefined) { 
                this.io.to(socket_id).emit('server:reconnected', { status: 'No orders' });
                return
            }
            const key = this.cache.keys();
            console.log('key de reconnect',key)

            console.log('verifico en el cache')
            if(this.cache.has(order)) { 
                console.log('Se consiguio')
                this.cache.set(order,socket_id);
                console.log('Se seteo')
                this.io.to(socket_id).emit('server:reconnected', { status: 'reconnected' });
                await this.orderUpdateStatusToClient(order)
                console.log('orden actualizada')
            }else  { 
                this.io.to(socket_id).emit('server:reconnected', { status: 'No orders' });
            }
            
        }catch(err) { 
            console.error(err)
            this.socket.emit('server:error',{status:400,error:err});
        }
    }
    
} 


function verifyAmountAvailable(
    currentAmount: Array<{ amount: number; id: number }>,
    orderAmount: Array<{ amount: number; id: number }> ):number[] {
    const clavesInCommon:number[] = [];
    
    if(currentAmount.length == orderAmount.length) { 
        for (let i = 0; i < currentAmount.length; i++)  { 
            const currentValue = currentAmount[i]; 
            const orderValue = orderAmount[i];

            if (currentValue.amount <  orderValue.amount) {
                clavesInCommon.push(currentValue.id);
                
            }
        }

    }
    return clavesInCommon

  
}