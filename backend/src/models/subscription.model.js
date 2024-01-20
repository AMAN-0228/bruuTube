import mongoose from 'mongoose'

const subscriptionSchema =  new Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subscribers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
},{
    timestamps: true
})

export const Subscription = new mongoose.model("Subscription",subscriptionSchema)