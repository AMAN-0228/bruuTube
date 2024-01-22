import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type:'auto'
            }
        )
        // file has been successfully uploaded on cloudinary
        console.log(`File has been successfully uploaded on cloudinary with url: ${response.url}`)
        return response

    } catch (error) {
        console.log(`Error while uploading file on cloudinary: ${error}`);
        // remove locally saved file from our server in case of error or fail to upload
        fs.unlinkSync(localFilePath)
    }
}

export {uploadOnCloudinary}