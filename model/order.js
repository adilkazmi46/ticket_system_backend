var mongoose = require("mongoose");

let orderSchema = mongoose.Schema({
orderID:String,
payerID:String,
user_id:String,
user_email:String,
matchID:String,
date:String,
time:String,
category:String,
subCategory:String,
address:Object,
products:Array,
amount:String,
currency:String,
createTime:String
});

module.exports=mongoose.model("Order",orderSchema);