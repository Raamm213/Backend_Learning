import { Router } from "express";
import authMiddle from "../middlewares/auth.middleware.js";
import { checkIfSubscribed, getSubscribersOfChannel, getSubscriptionsByUser, subscribe, unsubscribe } from "../controllers/subscription.controllers.js";


const routerSubscription = Router()

routerSubscription.post('/',authMiddle,subscribe)
routerSubscription.delete('/unsubscribe/channel/:channel',authMiddle,unsubscribe)
routerSubscription.get('/check/channel/:channel',authMiddle,checkIfSubscribed)

routerSubscription.get('/user/:user',getSubscriptionsByUser)
routerSubscription.get('/channel/:channel',getSubscribersOfChannel)





export default routerSubscription