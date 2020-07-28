var express = require('express');
var router = express.Router();
var contactController = require("../controller/contactUs");


router.post("/",contactController.contactUs);





module.exports = router;
