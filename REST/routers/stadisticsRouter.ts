
import  express,{ request,response } from "express";
import { stadisticsController } from "../controllers/stadisticsControllers";
const routerStadistics = express.Router()
const stadistics = new stadisticsController()


routerStadistics.get('/stadistcs/dashboard/admin',stadistics.stadistcAdmin)

export default routerStadistics