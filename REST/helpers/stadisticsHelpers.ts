import { PrismaClient } from "@prisma/client";
import { number } from "joi";
const prisma = new PrismaClient()


export class stadisticsHelper { 
    constructor() {}

    public async countClients() {
        try{
            const totalClients = await prisma.clients_online.count(
                { 
                    select: {
                        id_client:true
                    },
                
                }
            )

            const totalDishOrded = await prisma.order_dish.count( {
                orderBy: {
                    id_dish: {
                        sort:"asc"
                    }
                }
            })

            const idDishesFavorites = await prisma.order_dish.groupBy({
                by: ['id_dish'], // Agrupa por el ID del plato
                _count: {
                    id_dish: true,
                },
                orderBy: {
                    _count: {
                        id_dish: 'desc',
                    },
                },
                take: 5 , // Opcional: limita a los 10 platos más populares
            });
            

            const dishIds = idDishesFavorites.map(dish => dish.id_dish);
          
            const validDishIds: number[] = dishIds.filter((id): id is number => id !== null);

            const favoriteDishes = await prisma.dish.findMany({ 
                where: { 
                    id: { 
                        in:validDishIds
                    }
                },
                select: {
                    name:true,
                    price:true,
                }
            })
         

            const ordersWithStatusConfirmed = await prisma.payments.groupBy({ 
                by:['id_order'],
                _count: {
                    id_order:true,
                },
                where: {
                    status: 'Confirmado'
                }

            }) 

            console.log(ordersWithStatusConfirmed)
           
            // Extraer los id_order y filtrar valores nulos
            const validIds: number[] = ordersWithStatusConfirmed
            .map(order => order.id_order) // Mapea para obtener solo los id_order
            .filter((id): id is number => id !== null); // Filtra los valores nulos

            const profit = await prisma.order_dish.findMany({ 
                select: {
                    id_dish:true
                },
                where: {
                    id_order: { 
                        in:validIds
                    }
                }
            }) 
            console.log(profit)
            const validIdDish: number[] = profit
            .map(order => order.id_dish) // Mapea para obtener solo los id_order
            .filter((id): id is number => id !== null); // Filtra los valores nulos
 // para mañana 

            

            const typeOfOrder = await prisma.orders.groupBy({
                by:['order_type'],
                _count: {
                    status:true
                }
                
            })
            return { 
                totalClients,
                totalDishOrded,
                favoriteDishes,
                typeOfOrder,
            
            }
        }catch(err) {
            console.log(err)
            throw err
        }
    }
}
