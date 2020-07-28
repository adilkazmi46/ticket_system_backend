var mongoose = require("mongoose");

let userSchema = mongoose.Schema({
fullName:String,
email:String,
password:String,
role:String,
profilePic:String,
phone:String,
userName:String,
appartment:String,
streetAddress:String,
city:String,
country:String,
state:String,
zip:String
});


module.exports=mongoose.model("User",userSchema);