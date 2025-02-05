
import  express from "express";
import { StadisticsController } from "../controllers/stadisticsControllers";
const routerStadistics = express.Router()
const stadistics = new StadisticsController()


routerStadistics.get('/stadistcs/dashboard/admin',stadistics.stadistcAdmin)

export default routerStadistics