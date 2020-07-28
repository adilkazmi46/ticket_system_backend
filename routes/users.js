var express = require('express');
var router = express.Router();
var userController = require("../controller/user");
var authMiddlerware = require("../middleware/auth");
var config = require("../config.json");
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


const multerS3 = require( 'multer-s3' );
const multer = require('multer');
const aws = require( 'aws-sdk' );
const constants = require("../config.json");
const path = require("path");
const { authenticate } = require('../middleware/auth');



const s3 = new aws.S3({
    accessKeyId: constants.AWS_S3_USER_ACCESS_KEY,
    secretAccessKey: constants.AWS_S3_USER_SECRET_KEY,
    Bucket:config.AWS_S3_BUCKET
   });


const uploadProfilePic = multer({
    
    storage: multerS3({
     s3: s3,
     bucket: config.AWS_S3_BUCKET,
     acl: 'public-read',
     key: function (req, file, cb) {
      cb(null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
     }
    }),   
   });




router.post("/signup",userController.singup);
router.post("/signup-admin",userController.signupAdmin);
router.post("/signin",userController.signin);

 
router.post("/change-password",authMiddlerware.authenticate,userController.changePassword);

router.post("/save-profile-info",authMiddlerware.authenticate,uploadProfilePic.single('profilePic'),userController.saveProfileInfo);
router.get("/get-profile-info",authMiddlerware.authenticate,userController.getProfileInfo);

router.post("/save-shipping-info",authMiddlerware.authenticate,userController.saveShippingInfo);
router.get("/get-shipping-info",authMiddlerware.authenticate,userController.getShippingInfo); 


module.exports = router;
