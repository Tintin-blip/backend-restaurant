import { Socket } from "socket.io";

// Middleware 
export async function validateSchema(schema: any, data: any): Promise<string | null> {
    console.log(data)
    const { error } = schema.validate(data);
    
    return error ? error.details[0].message : null; // return null or error
}

// this function is used to emit client 
export function handleError(socket:Socket, err: string | null): void {
    if (err) {
        socket.emit('server:error', err); // send error to client
        return;
    }
}

// function to get error, handle it and emit to client
export async function validateFields(schema:any,data:any,socket:any):Promise <string | null | undefined>    { 
    const errorMessage = await validateSchema(schema,data) 
    handleError(socket,errorMessage)
     return errorMessage;
}
  
