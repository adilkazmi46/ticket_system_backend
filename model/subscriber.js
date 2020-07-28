var mongoose = require("mongoose");


let subscribersSchema = mongoose.Schema({
email:String
});

module.exports=mongoose.model("Subscriber",subscribersSchema);