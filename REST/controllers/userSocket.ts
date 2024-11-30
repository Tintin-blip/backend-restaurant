import { Socket } from 'socket.io';
import { UserHelper } from '../helpers/userHelpers';

const userHelper = new UserHelper();

export function registerUserEvents(socket: Socket, io: any) {
    
    // Function to emit all sockets
    async function emitUpdatedUserList() {
        try {
            const users = await userHelper.getAllUser();
            io.emit('server:userDetails', users);  // Emit all sockets
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            socket.emit('server:error', 'Error al obtener la lista de usuarios');
        }
    }
    // Evento para pedir la lista de usuarios
    socket.on('client:requestUsers', async () => await emitUpdatedUserList());
    
    socket.on('client:user_create', async ({ name, password,rol,ci }) => {
        try {
            const data = { name, password,rol,ci};
            await userHelper.createUser(data);

            // Emitir la lista actualizada de usuarios a todos los clientes
            await emitUpdatedUserList();
        } catch (err) {
            socket.emit('server:error', 'Error al crear el usuario');
        }
    });
}