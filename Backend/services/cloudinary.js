import {v2 as cloudinary} from "cloudinary"
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) {
            return null
            console.log("Could not find path!")
        }
        //Upload file on cloudinary
        const response = await cloudinary.upload(localFilePath,{resource_type: "auto"})
        
        //File upload successfully
        console.log("File Uploaded Successfully on Cloudinary!",response.url);
        return response
    }
    catch (error) {
        fs.unlinkSync(localFilePath)
    }
}

export default uploadCloudinary;