import multer from "multer"

const storage = multer.diskStorage({

    // files are stored on pulic directory in temp folder

    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },

    // i made this configuration for that if my file is not going to the cloudinary then i want that my file is to be stored atleast my own local so that if i want to get it then in future i am easily able to get that
    filename: function (req, file, cb) {
        console.log("File uploaded through multer :",file);
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ 
    storage: storage 
 })