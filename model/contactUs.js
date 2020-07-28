var mongoose = require("mongoose");

var contactUsSchema =  mongoose.Schema({
name:String,
email:String,
phone:String,
message:String
});

module.exports=mongoose.model("ContactUs",contactUsSchema);