import multer from 'multer';
//got the code from multer documentation

const storage = multer.diskStorage({ //diskstorage: stores files on disk(server's disk). alternate memoryStorage: stores files in memory(RAM)
  destination: function (req, file, cb) { //this function decides where the file will be stored. 
                                        // parameters: req: incoming http req. contains user info, headers, auth data, etc. file: metadata about the file eg orgininalname,size,etc. cb: callbackfunction which tells multer destination path & success or failure.
    cb(null, "./public/temp") //null: no error. "public/temp" folder where file is saved.
  },
  filename: function (req, file, cb) { //This function decides WHAT the file will be named.
    cb(null, file.originalname )//null means no error. file.originalname: original name of the uploaded file.
    //customize the filename for uniqueness
  }
})

export const upload = multer({ storage: storage }) //upload becomes a middleware that can be used in routes to handle file uploads. multer({ storage }):tells Multer to use your diskStorage rules