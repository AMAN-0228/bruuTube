import mongoose from "mongoose";

const userCacheSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cacheKey: {
        type: String,
        required: true,
    },
    authDetails: {
        type: String,
        required: true
    },
    cacheValue: {
        type: Object,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
},{
    timestamps: true
});

export const UserCache = mongoose.model('UserCache', userCacheSchema);