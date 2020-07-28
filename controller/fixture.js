var User = require("../model/user");
var Fixture = require("../model/fixture");
var Validator = require("validatorjs");
var authMiddleware = require("../middleware/auth");
var mongoose = require("mongoose")

let addFixtureSchema = {
    "teamA_name":"string|required",
    "teamA_logo":"string|required",
    "teamB_name":"string|required",
    "teamB_logo":"string|required",
    "stadium":"string|required",
    "date":"string|required",
    "time":"string|required"
};

let editFixtureSchema = {
    "teamA_name":"string|required",
    "teamA_logo":"string|required",
    "teamB_name":"string|required",
    "teamB_logo":"string|required",
    "stadium":"string|required",
    "date":"string|required",
    "time":"string|required",
    "matchID":"string|required"
};

let addAvailableSeatsSchema={
    "longSideLower":"array|required",
    "longSideUpper":"array|required",
    "behindGoal":"array|required",
    "awayEnd":"array|required"
}

exports.addFixture=async (req,res,next)=>{
try{
    let user=await User({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        if(user.role-="admin"||user.role=="sub-admin"){
        let {teamA_name,teamB_name,stadium,date,time}=req.body;
        let teamA_logo=req.files[0].location;
        let teamB_logo=req.files[1].location;
        let validator=new Validator({teamA_logo,teamA_name,teamB_logo,teamB_name,stadium,date,time},addFixtureSchema);
        if(validator.passes()==false){
            res.status(422).send({errors:validator.errors.errors});
        }
        else{
            let fixture= new Fixture({
               teamA:{
                   name:teamA_name,
                   logo:teamA_logo
               },
               teamB:{
                   name:teamB_name,
                   logo:teamB_logo
               },
               stadium:stadium,
               time:time,
               matchID:mongoose.Types.ObjectId()
            });
            await fixture.save();
            res.send({success:true,message:"successfully created the fixture"});
        }

        }else{
             res.status(401).json({errors:["you are not authorized only admin or sub-admin can access it"]});

        }
    }

}catch(err){
console.log(err);
res.status(500).json({erros:["something went wrong"]});
};
};

exports.getFixtures = async (req,res,next)=>{
try{
    let user=await User({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        
         let fixtures=await Fixture.find().select("teamA","teamB","stadium","matchID","category","subcategory","time","date");
          res.send({fixtures:fixtures});  
        
}
}catch(err){
    console.log(err);
    res.status(500).send({errors:["something went wrong"]});
}
};

exports.addAvailableSeats = async (req,res,next)=>{
    try{
        let user=await User({_id:req.userID});
        if(user==null){
            res.status(401).json({errors:["you are not authorized kindly login to continue"]})
        }else{
            if(user.role-="admin"||user.role=="sub-admin"){

              let {longSideLower,longSideUpper,awayEnd,behindGoal,matchID}=req.body;

              let fixture=await Fixture.find({matchID:matchID});
               longSideLower=await new Set(...fixture.longSideLower,...longSideLower);
               longSideUpper=await new Set(...fixture.longSideUpper,...longSideUpper);
               behindGoal=await new Set(...fixture.behindGoal,...behindGoal);
               awayEnd=await new Set(...fixture.awayEnd,...awayEnd);

              fixture.availableSeats.longSideLower=longSideLower;
              fixture.availableSeats.longSideUpper=longSideUpper;
              fixture.availableSeats.behindGoal=behindGoal;
              fixture.availableSeats.awayEnd=awayEnd;
              
            }
            else{
                res.status(401).json({errors:["you are not authorized only admin or sub-admin can access it"]});
           }

        }
    }catch(err){
        console.log(err);
        res.status(500).json({errors:["something went wrong"]});
    }
};

exports.editFixture = async (req,res,next)=>{
try{
    let user=await User({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        if(user.role-="admin"||user.role=="sub-admin"){
        let {teamA_name,teamB_name,stadium,date,time,matchID}=req.body;
        let teamA_logo=req.files[0].location;
        let teamB_logo=req.files[1].location;
        let validator=new Validator({teamA_logo,teamA_name,teamB_logo,teamB_name,stadium,date,time,matchID},editFixtureSchema);
        if(validator.passes()==false){
            res.status(422).send({errors:validator.errors.errors});
        }
        else{
            let fixture= await Fixture.findOne({matchID:matchID});

               fixutre.teamA={
                   name:teamA_name,
                   logo:teamA_logo
               };
               fixture.teamB={
                   name:teamB_name,
                   logo:teamB_logo
               };
               fixture.stadium=stadium;
               fixture.time=time;
               
            await fixture.save();
            res.send({success:true,message:"successfully edited the fixture"});
        }

        }else{
             res.status(401).json({errors:["you are not authorized only admin or sub-admin can access it"]});

        }
    }
}catch(err){
    console.log(err);
    res.status(500).send({errors:["something went wrong"]});
}
};







