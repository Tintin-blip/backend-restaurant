import  {Response,Request}  from "express";
import { dishHelper } from "../../domain/helpers/dishHelpers";
import  { baseResponse} from '../messages/messagesRes';


export class dishControllers { 
    private dishHelper:dishHelper;
    private baseResponse:baseResponse;
    constructor() {
        this.dishHelper = new dishHelper();
        this.baseResponse = new baseResponse();

    }
    public getAll = async (req: Request, res: Response)=> {
        try {
            const dishes = await this.dishHelper.getAllDish();
            this.baseResponse.sendResponse(res, 200, 'Ok', dishes);
        } catch (err) {
            console.error(err);
            this.baseResponse.handleError(res, 'Error retrieving dishes');
        }
    };
    public newDish = async(req:Request,res:Response) => { 
        const data = req.body;
        try { 
            await this.dishHelper.createNewDish(data);
            this.baseResponse.sendResponse(res,201,'dish created');
        }catch(err) { 
            console.error(err);
            this.baseResponse.handleError(res, 'Error retrieving dishes');

        }
    }

    public   addAmountDish = async(req:Request,res:Response) =>  {
        const {id_dish,amount} = req.body
        try { 
            await this.dishHelper.addAmountDish(id_dish,amount);

            this.baseResponse.sendResponse(res,200,'succesfull');
        }catch(err) { 
            console.error(err);
            this.baseResponse.handleError(res, 'Error retrieving dishes');

        }
        
    }
    public  deleteDishWithId = async(req:Request,res:Response)=> { 
        try{
            const {id_dish } = req.body
            await this.dishHelper.deleteDish(id_dish)
            this.baseResponse.sendResponse(res,200,'deleted')
        }catch(err) { 
            console.error(err);
            this.baseResponse[400](res,'Error')
        }
    }

    public editDishWithId = async(req:Request,res:Response) => {
        try {
            const {id_dish} = req.body
            const dish = req.body
            await this.dishHelper.updateDish(id_dish,dish)
            this.baseResponse.sendResponse(res,200,'edited')

        }catch(err) {
            console.error(err);
            this.baseResponse[400](res,'Error')
        }
    }
}