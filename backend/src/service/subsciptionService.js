import { Subscription } from "../models/subscription.model";
import asyncHandler from "../utils/asyncHandler";

const subscribeToggle = asyncHandler( async(req,res) =>{
    const {subscriptionStatus, channel} = req?.body

    if(!channel){
        throw new ApiError(400, "channel is required")
    }

    if(subscriptionStatus){
        // await Subscription
        
    }
})

export {
    subscribeToggle
}