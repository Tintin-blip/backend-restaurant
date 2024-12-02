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


    // take idOrder
    // Change status of orders. Orders.status = "Cocinando". payments.status = "Confirmado"
    // if detect any error, throw error
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
                        name:orderOnline.name,
                        tlf:orderOnline.tlf,
                        localization:orderOnline.localization,
                        

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
                    status:'Finalizado'
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
                        address:true,
                        name:true
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
                },
                AND: {
                    status:{
                        notIn: ['Finalizado']
                    }
                }
               },
        });
        const result = orders.map(order => {

            const { order_dish } = order; // Destructura para mayor claridad
        
            // Realiza todos los cálculos en una sola pasada
            const { totalPrice } = order_dish.reduce((acc, va) => {
                const price = va.dish?.price instanceof Decimal ? va.dish.price.toNumber() : va.dish?.price || 0;
                acc.totalPrice += price; // Sumar al total
                return acc;
            }, { totalPrice: 0 });
            const price = totalPrice.toFixed(2);
            const ivaValue = (totalPrice * 0.16).toFixed(2);
            const total_price = (parseFloat(price) + parseFloat(ivaValue)).toFixed(2);
            
            return {
                ...order,
                clients_online: order.clients_online ? {
                    tlf: order.clients_online.tlf,
                    address: order.clients_online.address,
                    name:order.clients_online.name
                } : undefined,
                order_dish: countOccurrences(order_dish),
                price: price,
                IVA: ivaValue,
                total_price: total_price
            };

        })
        
      
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
                        address:true,
                        name:true
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
                        status:true,
                        ref_:true
                    }
                }
    
            },
            where: { 
                id:idOrder
            }
        });
        
        const result = orders.map(order => {

            const { order_dish } = order; // Destructura para mayor claridad
        
            // Realiza todos los cálculos en una sola pasada
            const { totalPrice } = order_dish.reduce((acc, va) => {
                const price = va.dish?.price instanceof Decimal ? va.dish.price.toNumber() : va.dish?.price || 0;
                acc.totalPrice += price; // Sumar al total
                return acc;
            }, { totalPrice: 0 });
            const price = totalPrice.toFixed(2);
            const ivaValue = (totalPrice * 0.16).toFixed(2);
            const total_price = (parseFloat(price) + parseFloat(ivaValue)).toFixed(2);
            
            return {
                ...order,
                client_online: order.clients_online ? {
                    tlf: order.clients_online.tlf,
                    address: order.clients_online.address,
                    name:order.clients_online.name
                } : undefined,
                order_dish: countOccurrences(order_dish),
                price: price,
                IVA: ivaValue,
                total_price: total_price
            };

        },
    );

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


// count occurrences and create summation
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