var mongoose = require("mongoose");

var fixtureSchema = mongoose.Schema({
teamA:{
name:String,
logo:String
},
teamB:{
name:String,
logo:String
},
stadium:String,
matchID:mongoose.Schema.Types.ObjectId,
date:String,
time:String,
category:String,
subCategory:String,
availableSeats:{
longSideLower:Array,
longSideUpper:Array,
behindGoal:Array,
awayEnd:Array
}
});

module.exports=mongoose.model("Fixture",fixtureSchema);