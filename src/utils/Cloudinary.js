import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("Local file path is not provided.");

        console.log("Uploading to Cloudinary with path:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("Cloudinary Response:", response);

        // File uploaded successfully
        return response;
    } catch (error) {
        console.error("Error during Cloudinary upload:", error.message || error);
        if (fs.existsSync(localFilePath)) {
            console.log("Deleting local file after failed upload:", localFilePath);
            fs.unlinkSync(localFilePath); // Remove local file after failure
        }
        return null;
    }
};



export {uploadOnCloudinary}