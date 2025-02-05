
export class BaseResponse  { 
    public async sendResponse(res: any, status: number, message: string, data?: any) {
        res.status(status).json({
            message,
            data
        });
    }
    public async handleError(res: any, error: string) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
    public async unauthorized(res: any, message:string) {
        res.status(401).json({
            message
        });
    }
    public async 400(res: any, message:string) {
        res.status(400).json({
            message
        });
    }
} 
export default BaseResponse