var express = require('express');
var router = express.Router();
var subscriberController = require("../controller/subscriber");
var authMiddlerware = require("../middleware/auth");

router.post("/",()=>{

});

router.post("/add-subscriber",subscriberController.addSubscriber);
router.post("/email-to-subscribers",authMiddlerware.authenticate,subscriberController.emailToSubscribers)
module.exports = router;
