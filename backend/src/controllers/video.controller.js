import asyncHandler from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import {Video} from '../models/video.model.js'
import ApiResponse from "../utils/ApiResponse";

const publishVideo = asyncHandler( async (req, res) => {        //to upload/add video on site/software
    // take tittle and description
    const {tittle, description} = req.body
    if(!tittle || !description){
        throw new ApiError(400, "tittle and description both are required")
    }

    // take video file 
    const videoLocal = req?.file
    if(!videoLocal){
        throw new ApiError(500, "video cannot be found")
    }
    
    // upload video on cloudinary
    const videoPath = await uploadOnCloudinary(videoLocal.path)
    if(!videoPath){
        throw new ApiError(500, "video cannot be uploaded on cloudinary")
    }

    // create video
    const video = await Video.create({
        tittle,
        description,
        videoFile: videoPath,
        owner: req?.user?._id
    })
    if(!video){
        throw new ApiError(500, "Failed to add video")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, "Video added successfully", video)
    )

})

const togglePublish = asyncHandler(async(req, res) => {
    
    const {isPublished, videoId} = req?.body
    
    if(!videoId){
        throw new ApiError(400, "videoId is required to toggle publish")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            isPublished
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Video toggled successfully", video?.isPublished)
    )
})

const deleteVideo = asyncHandler(async(req, res) => {

    const {videoId} = req?.params
    if(!videoId){
        throw new ApiError(400, "videoId is required")
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Video deleted successfully")
    )
})

const updateVideo = asyncHandler(async(req, res) => {

    const {videoId} = req?.params
    if(!videoId){
        throw new ApiError(400, "videoId is required")
    }

    const {tittle, description , thumbnail} = req?.body

    if(
        [tittle, description, thumbnail].some(field=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields (tittle, description, thumbnail) are required on update")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            tittle,
            description,
            thumbnail
        }
    )

    if(!video){
        throw new ApiError(500, "Failed to update video")
    }

    return res
    .status
    .json(
        new ApiResponse(200,)
    )
})

export {
    publishVideo,
    togglePublish,
    deleteVideo,
    updateVideo
}