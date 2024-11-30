import { Socket } from "socket.io";
import {dishHelper} from '../../domain/helpers/dishHelpers'

export class dishEvents { 
    private dishHelper;
    public socket:Socket;
    public io;

    constructor(socket:any,io:any) {
        this.dishHelper = new dishHelper();
        this.socket  = socket
        this.io = io;


    }
    
    
    public async emitAllDish() {
        try {
            console.log('Entre')
            const users = await this.dishHelper.getAllDish();
            this.io.emit('server:userDetails', users);  // Emit all sockets
        
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            this.socket.emit('server:error', 'Error al obtener la lista de usuarios');
        }
    }

    public async emitCreate (
        name:string,
        price:number,
        description:string,
        amount:number,
        category:string,
        img?:string,
    )  {
        try {
            const data = { name,price,description,amount,category,img};
            const create = await this.dishHelper.createNewDish(data)
            console.log(create)
            await this.emitAllDish();
        } catch (err) {
           this.socket.emit('server:error', 'Error al crear el usuario');
        }
    }
    

}