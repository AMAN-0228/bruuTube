import mongoose from 'mongoose'

const subscriptionSchema =  new Schema({
    channel:{
        type: mongoose.Schema.Types.ObjectId,   // one to whom is subscribing
        ref: "User"
    },
    subscriber:[{
        type: mongoose.Schema.Types.ObjectId,   //one who is subscribing
        ref: "User"
    }]
},{
    timestamps: true
})

export const Subscription = new mongoose.model("Subscription",subscriptionSchema)