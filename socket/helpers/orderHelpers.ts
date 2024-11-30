import { PrismaClient } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library'; // Importa Decimal de Prisma
import { DishSummary, OrderDish, OrderOnline } from "../../domain/models/interfaces";
import NodeCache from "node-cache";
const prisma = new PrismaClient()
export class orderHelper { 
    cache:NodeCache
    constructor(cache:NodeCache) {
        this.cache = cache
    };  
    public async verifyRef(idOrder:number) { 
        try{
            await prisma.payments.update( { 
                where: { 
                    id_order:idOrder
                },
                data: {
                    status:'Confirmado'
                }
            
            })

            await prisma.orders.update( {
                where:  { 
                    id:idOrder
                },
                data: {
                    status:'Cocinando'
                }
            })
        }catch (error) {
            console.error("Error update ref:", error);
            throw error; // Maneja el error según tu lógica
        }   
    }

    public async createOrderOnline(orderOnline: Record<string,any>):Promise <OrderOnline> {
        try {

                const client = await prisma.clients_online.create( {
                    data: { 
                        address:orderOnline.address,
                        tlf:orderOnline.tlf,
                        localization:orderOnline.localization

                    }
                })
                const newOrder = await prisma.orders.create({
                    data: {
                        ci: orderOnline.ci,
                        status:'En espera',
                        order_type: orderOnline.order_type,
                        id_client:client.id_client
                    },
                });
           
                const orderDishData: {id_dish:number; id_order:number }[] = []
                
                orderOnline.order_dish.forEach((dish: any) => {
                    for (let i = 0; i < dish.amount; i++) {
                        orderDishData.push({
                            id_dish: dish.id_dish,
                            id_order: newOrder.id
                        });
                    }
                });
    
            await prisma.order_dish.createMany({
               data:orderDishData })

            await prisma.payments.create({
                data: {
                    id_order:newOrder.id,
                    method:orderOnline.method,
                    ref_:orderOnline.ref,
                    status:'Pendiente',
                    date_time: new Date()
                }
            })
        return newOrder
        } catch (error) {
            console.error("Error creating order:", error);
            throw error; // Maneja el error según tu lógica
        }
    }


    public async orderKitchen() { 
        try {
            const orders = await prisma.orders.findMany( { 
                select: { 
                    id:true,
                    id_table:true,
                    ci:true,
                    order_type:true,
                    order_dish: { 
                        select: {
                            
                            dish: { 
                                
                                select: { 
                                    name:true,
                                }
                            }
                        }
                    },
                    
                },
                where: { 
                    payment: { 
                        status:'Confirmado'
                    }
                }
           
            })
            return orders
        } catch (error) {
            console.error("Error creating order:", error);
            throw error; // Maneja el error según tu lógica
        }   
    }

    public async updateOrderStatusToDelivery(idOrder:number) { 
        try {

            await prisma.orders.update( {
                where: {
                    id:idOrder
                },
                data: { 
                    status:'En vía'
                },
            })
        }catch (error) {
            console.error("Error update status order:", error);
            throw error; // Maneja el error según tu lógica
        }  

    }

    public async updateOrderToFinished(idOrder:number) { 
        try {

            await prisma.orders.update( {
                where: {
                    id:idOrder
                },
                data: { 
                    status:'Entregado'
                },
            })
        }catch (error) {
            console.error("Error update status order:", error);
            throw error; // Maneja el error según tu lógica
        }  

    }


    public async orderSelectFic(){
        try{ 
            const orders = await prisma.orders.findMany({    
                select: { 
                id:true,
                status:true,
                ci:true,
                date:true,
                order_type:true,
                clients_online: { 
                    select: { 
                        tlf:true,
                        address:true
                    }
                },
                order_dish: { 
                    select: {
                        
                        dish: { 
                            
                            select: { 
                                name:true,
                                price:true
                            }
                        }
                    }
                },
                payment: { 
                    select: { 
                        method:true,
                        ref_:true
                    }
                }
                
            },
            where: {
                payment:{
                    status:'Pendiente'
                }
               },
        });
        
         const result= orders.map(order => ({
            ...order,   
            client_online: order.clients_online ? {
                tlf: Number(order.clients_online.tlf),
                address: order.clients_online.address
            } : undefined,
            order_dish:countOccurrences(order.order_dish),
            total_price: order.order_dish.reduce((acc,va) => acc +(va.dish?.price instanceof Decimal ? va.dish.price.toNumber() : va.dish?.price || 0), 0,
        )
          }));
        
          
        return result;
    
        }catch (error) {
            console.error("Error creating order:", error);
            throw error; // Maneja el error según tu lógica
        }
        }
 
        

    public async orderClientOnline(idOrder:number) { 
        try {
            const orders = await prisma.orders.findMany({    
                select: { 
                id:true,
                status:true,
                ci:true,
                date:true,
                order_type:true,
                clients_online: { 
                    select: { 
                        tlf:true,
                        address:true
                    }
                },
                order_dish: { 
                    select: {
                        
                        dish: { 
                            
                            select: { 
                                name:true,
                                price:true
                            }
                        }
                    }
                },
                payment: {
                    select: { 
                        status:true
                    }
                }
    
            },
            where: { 
                id:idOrder
            }
        });
        
         const result= orders.map(order => ({
            ...order,   
            client_online: order.clients_online ? {
                tlf: Number(order.clients_online.tlf),
                address: order.clients_online.address
            } : undefined,
            order_dish:countOccurrences(order.order_dish),
            IVA: '16%',
            total_price: (order.order_dish.reduce((acc,va) => acc +(va.dish?.price instanceof Decimal ? va.dish.price.toNumber() : va.dish?.price || 0), 0,) *0.16).toFixed(2)
          }));
        return result;
            

        }catch(err) { 
            console.log(err)
            throw err
        }
    }

    public async getIdOrderByCiWithStatus(ci:number) { 
        try {
            if(!ci || ci == undefined) { 
                throw new Error('ci is undefined')
            }
            const orders = await prisma.orders.findFirst({    
                select: { 
                    id:true
                },
                where: { 
                    ci:ci, 

                    AND: { 
                        status: { in: ['En espera', 'Cocinando','En via'] }
                    }
                }
            })

            return orders?.id

            

        }catch(err) { 
            console.log(err)
            throw err
        }
    }

    public async getOrdersWithStatus() { 
        try { 
            const orders = await prisma.orders.findMany({    
                select: { 
                    id:true
                },
                where: { 
                    AND: { 
                        status: { in: ['En espera', 'Cocinando','En via'] }
                    }
                }
            })

            return orders

            

        }catch(err) { 
            console.log(err)
            throw err
        }
    }
}



function countOccurrences(orderDishes: OrderDish[]): DishSummary[] {
    const countMap: Record<string, { quantity: number; price: number }> = {};
  
    orderDishes.forEach((orderDish: OrderDish) => {
      const dishName = orderDish.dish?.name;
      const dishPrice = orderDish.dish?.price;
  
      if (typeof dishName === 'string' && dishName) {
        if (!countMap[dishName]) {
          countMap[dishName] = { quantity: 0, price: 0 };
        }
        countMap[dishName].quantity += 1;
        countMap[dishName].price += dishPrice instanceof Decimal ? dishPrice.toNumber() : Number(dishPrice) || 0;
      }
    });
  
    return Object.entries(countMap).map(([name, { quantity, price }]) => ({
      name,
      quantity,
      price
    }));
}