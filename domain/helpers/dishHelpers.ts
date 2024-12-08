import { dish, PrismaClient } from '@prisma/client'
import { Dish, DishEdit } from '../models/interfaces';
const prisma = new PrismaClient()

export class dishHelper { 

    constructor() {
       
    }
    
    public async getAllDish(){ 
        try { 
            const dishes = await prisma.dish.findMany();
            return dishes

        }catch(err)  { 
            console.log(err)
            throw err;
        }

    }
    public async createNewDish (dish:Dish):Promise <void> { 
        try{ 
            await prisma.dish.create(
                {
                    data:{
                        name:dish.name,
                        price:dish.price,
                        description:dish.description,
                        amount:dish.amount,
                        category:dish.category,
                        img:dish.img
                    }
                }
            )
        }catch(err) { 
            console.error(err)
            throw err;
        }

        
    }

    public async addAmountDish(idDish: number, newAmount: number):Promise<void> { 
        

        try{
        const currentAmount = await prisma.dish.findUnique( { 
            where: { 
                id:idDish
            },
            select: { 
                amount:true
            }
        }) 
        if(!currentAmount?.amount || currentAmount?.amount == undefined) { 
            throw new Error('No hay cantidad')
        }

            await prisma.dish.update( {
                    where: { 
                        id:idDish
                    },
                    data: { 
                        amount:currentAmount?.amount + newAmount // number to add
                    } 
                
            })
        }catch(err) { 
            console.error(err)
            throw err;
        }

    }
    public async subtractAmountDish(dishWithAmount: Array<{ id_dish: number; amount: number }>): Promise<void> {
        try {
            for (const { id_dish, amount } of dishWithAmount) {
                await prisma.dish.update({
                    where: {
                        id: id_dish,
                    },
                    data: {
                        amount: {
                            decrement: amount
                        },
                    },
                });
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    
    public async getAmountDishToId(arr: Array<string>) { 
        try { 
            const numbers: number[] = arr.map(number => parseInt(number,10))
            
            const currentAmount = await prisma.dish.findMany( {
                where: { 
                    id:{ 
                        in:numbers
                    }
                },
                select: { 
                    id:true,
                    amount:true,
                }
            })
            if(!currentAmount ) { 
                throw new Error('Error al obtener los datos')
            }

            return currentAmount

        }catch(err) {
            console.log(err)
            throw err
        }
    } 

    public async deleteDish(id_dish:number): Promise <void> { 
        try {
            await prisma.dish.delete( { 
                where: { 
                    id:id_dish
                }
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    public async updateDish(id_dish:number,dish:DishEdit): Promise <void> { 
        try { 
            await prisma.dish.update({
                where: {
                    id:id_dish
                },

                data: {
                    name:dish.name,
                    price:dish.price,
                    description:dish.description,
                    category:dish.category,
                    amount:dish.amount,
                    img:dish.img
                }
            })
            
        }catch(err) {
            console.error(err); throw err
        }
    }
}