import { Server } from "./server";
import { orderHelper} from "./socket/helpers/orderHelpers";
import NodeCache from "node-cache";
export const cache = new NodeCache();

const server = new Server(cache);
const orderHelpers = new orderHelper(cache)

server.listen();

const setCache =  async():Promise <void> => { 
const orders = await orderHelpers.getOrdersWithStatus();
    if(!orders) { 
        console.log('No orders to store in cache')
        return
    }
    for(let i = 0;i<orders.length;i++) { 
        orderHelpers.cache.set(orders[i].id,'not socket')
        }
    console.log('Cache Inserted')
}


(async () => {
    await setCache();
})();
