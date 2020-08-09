var express = require('express');
var router = express.Router();
var fixtureController = require("../controller/fixture");
var authMiddleware = require("../middleware/auth");
var config = require("../config.json");

const multerS3 = require( 'multer-s3' );
const multer = require('multer');
const aws = require( 'aws-sdk' );
const constants = require("../config.json");
const path = require("path");




const s3 = new aws.S3({
    accessKeyId: constants.AWS_S3_USER_ACCESS_KEY,
    secretAccessKey: constants.AWS_S3_USER_SECRET_KEY,
    Bucket:config.AWS_S3_BUCKET
   });


const uploadLogos = multer({
    
    storage: multerS3({
     s3: s3,
     bucket: config.AWS_S3_BUCKET,
     acl: 'public-read',
     key: function (req, file, cb) {
      cb(null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
     }
    }),   
   }).single("logo");


 
 
router.post("/add-fixture",authMiddleware.authenticate,uploadLogos,fixtureController.addFixture)


router.post("/edit-fixture",authMiddleware.authenticate,uploadLogos,fixtureController.editFixture)

router.post("/add-seats",authMiddleware.authenticate,fixtureController.addAvailableSeats);

router.post("/edit-seat",authMiddleware.authenticate,fixtureController.editSeat);

router.delete("/delete-seat",authMiddleware.authenticate,fixtureController.deleteSeat);

router.delete("/delete-fixture",authMiddleware.authenticate,fixtureController.deleteFixture);

router.get("/get-fixtures",authMiddleware.authenticate,fixtureController.getFixtures);
router.get("/get-available-seats",authMiddleware.authenticate,fixtureController.getAvailableSeats);
router.get("/get-sold-seats",authMiddleware.authenticate,fixtureController.getSoldSeats);
module.exports = router;
       