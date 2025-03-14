import mongoose, {model, Schema} from 'mongoose'

const blockedUserSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    reason: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
        require: true,
    }
},{
    timestamps: true
});

export const blockedUser = model("blockedUser", blockedUserSchema);