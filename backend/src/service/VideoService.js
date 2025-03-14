import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from '../models/video.model.js'
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const publishVideo = asyncHandler( async (req, res) => {        //to upload/add video on site/software
    // take tittle and description
    const {tittle, description} = req.body
    if(!tittle || !description){
        throw new ApiError(400, "tittle and description both are required")
    }

    // take video file and thumbnail
    const videoLocal = req?.files.videoFile[0]
    if(!videoLocal){
        throw new ApiError(500, "video cannot be found")
    }

    const thumbnailLocalPath = req?.files.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(500, "thumbnail cannot be found")
    }
    
    // upload video on cloudinary
    const videoPath = await uploadOnCloudinary(videoLocal.path)
    if(!videoPath){
        throw new ApiError(500, "video cannot be uploaded on cloudinary")
    }
    const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailPath){
        throw new ApiError(500, "video cannot be uploaded on cloudinary")
    }

    // create video
    const video = await Video.create({
        tittle,
        description,
        videoFile: videoPath,
        thumbnail:thumbnailPath,
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
        
    const {videoId} = req?.params
    
    if(!videoId){
        throw new ApiError(400, "videoId is required to toggle publish")
    }
    
    const {isPublished} = req?.body

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

    const {tittle, description } = req?.body

    if(
        [tittle, description].some(field=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields (tittle, description, thumbnail) are required on update")
    }

    const thumbnail = req?.file
    if(!thumbnail){
        throw new ApiError(500, "thumbnail cannot be found")
    }

    const thumbnailPath = await uploadOnCloudinary(thumbnail.path)
    
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            tittle,
            description,
            thumbnail:thumbnailPath
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

const getVideoById = asyncHandler(async(req, res) => {

    const {videoId} = req?.params
    if(!videoId){
        throw new ApiError(400, "video Id is required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Video found successfully", video)
    )
})

const getAllVideos = asyncHandler(async(req, res) => {       //to get all videos as per query
    console.log('_________ get All videos __________');
    
})


export {
    publishVideo,
    togglePublish,
    deleteVideo,
    updateVideo,
    getVideoById,
    getAllVideos
}