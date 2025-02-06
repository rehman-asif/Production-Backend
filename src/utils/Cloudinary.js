import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("Response clouninary file upload ",response.url);
        // FILE  has been uploaded successfully
        console.log("File is uploaded on cloudinary");
        return response
    } catch (error) {
        // local file hmary server pr present hai and we want k in case if that file is not uploaded on cloudinary then we have to remove it from our server
        fs.unlinkSync(localFilePath)
    }
}

export {uploadOnCloudinary}