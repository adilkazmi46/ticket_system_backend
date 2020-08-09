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
    "matchID":"string|required",
    "seats":"array|required"
}

let deleteFixtureSchema,getAvailableSeatSchema = {
    "matchID":"string|required"
};

let seatSchema = {
    "productID":"required",
    "seat": "string|required",
    "price": "numeric|required",
    "sold": "boolean|required",
    "position":"string|required"
}

let editSeatSchema = {
    "product_id":"required",
    "position":"required",
    "match_id":"required",
    "price":"required",
    "seat":"required",
    "sold":"required"
}

 
let deleteSeatSchema = {
    "product_id":"required",
    "position":"required",
    "match_id":"required"
}



exports.addFixture=async (req,res,next)=>{
try{
    let user=await User.findOne({_id:req.userID});

    
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        if(user.role=="admin"||user.role=="sub-admin"){
        let {teamA_name,teamB_name,stadium,date,time,teamA_logo,teamB_logo}=req.body;
    
        let validator=new Validator({logo,teamA_name,teamB_name,stadium,date,time},addFixtureSchema);
        if(validator.passes()==false){
            res.status(422).send({errors:validator.errors.errors});
        }
        else{
             logo=req.files["logo"][0].location;
             

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
             res.status(401).json({errors:[{user:"you are not authorized only admin or sub-admin can access it"}]});

        }
    }

}catch(err){
console.log(err);
res.status(500).json({errors:["something went wrong"]});
};
};

exports.getFixtures = async (req,res,next)=>{
try{
    let user=await User.findOne({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        
         let fixtures=await Fixture.find();
          res.send({fixtures:fixtures});  
}
}catch(err){
    console.log(err);
    res.status(500).send({errors:["something went wrong"]});
}
};

exports.getAvailableSeats = async (req,res,next)=>{
    try{

        let user=await User.findOne({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        let {matchID}=req.body;
        let validator= new Validator({matchID},getAvailableSeatSchema);
        if(validator.passes()==false){
            res.status(422).json({errors:validator.errors.errors});
        }
        else{
         let fixture=await Fixture.findOne({
             matchID:mongoose.Types.ObjectId(matchID),
             "seats.sold":false
             });
             let seats=await fixture.seats.filter((item)=>{
                return item.sold!=true;
             })
          res.send({seats});  
        }
}   

    }catch(err){
        console.log(err);
    }
}

exports.getSoldSeats = async (req,res,next)=>{
    try{

        let user=await User.findOne({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        let {matchID}=req.body;
         let fixture=await Fixture.findOne({matchID:matchID,
            "seats.sold":false});
            let seats=await fixture.seats.filter((item)=>{
                return item.sold!=false;
             })
          res.send({seats});
  
}   

    }catch(err){
        console.log(err);
    }
}

exports.addAvailableSeats = async (req,res,next)=>{
    try{  
        console.log(req.userID);
        let user=await User.findOne({_id:req.userID});
       
        
        if(user==null){
            res.status(401).json({errors:["you are not authorized kindly login to continue"]})
        }else{
            console.log(user);
            if(user.role=="admin"||user.role=="sub-admin"){ 

              let {seats,matchID}=req.body;

              
             let validator = new Validator({seats,matchID},addAvailableSeatsSchema);

             if(validator.passes()==false){
                 res.status(422).json({errors:validator.errors.errors});
             }
             else{

                
               let fixture=await Fixture.findOne({matchID:matchID});

                 if(fixture==null){
                     res.status(401).json({errors:["invalida match id fixture does not exists"]})
                 }
                 else{
          
                for(var i=0;i<seats.length;i++){
                    seats[i].productID=await mongoose.Types.ObjectId();
                    seats[i].sold=false;
               if(seats[i].position=="longSideLower"||seats[i].position=="longSideUpper"||seats[i].position=="awayEnd"||seats[i].position=="behindGoal")
               {
                   
                    let seatValidator = new Validator(seats[i],seatSchema);
                    console.log(seats[i]);
                    if(seatValidator.passes()==false){
                       delete seats[i];   
                     }     
                    
                    }
                    else{
                        delete seats[i];
                    }
                   
                }

              fixture.seats=await [...fixture.seats,...seats]; 
              
              await fixture.save();
              res.json({success:true,message:"seats added successfully",
               seats
            });
        }
            }
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

    let user=await User.findOne({_id:req.userID});
    console.log(user.role);
    console.log(req.userID);
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        if(user.role=="admin"||user.role=="sub-admin"){
        let {teamA_name,teamB_name,stadium,date,time,matchID}=req.body;
         
        let teamA_logo=req.files["teamA_logo"][0].location;
        let teamB_logo=req.files["teamB_logo"][0].location;
       
        let validator=new Validator({teamA_logo,teamA_name,teamB_logo,teamB_name,stadium,date,time,matchID},editFixtureSchema);
        if(validator.passes()==false){
            res.status(422).send({errors:validator.errors.errors});
        }
        else{
            let fixture= await Fixture.findOne({matchID:matchID});

               fixture.teamA={
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

exports.deleteFixture = async (req,res,next) => {
try{
    
    let user=await User.findOne({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        if(user.role=="admin"||user.role=="sub-admin"){
          let {matchID}=req.body;
          let validator=new Validator({matchID},deleteFixtureSchema);
          if(validator.passes()==false){
              res.status(422).json({errors:validator.errors.errors})
          }
          else{
            let check=await Fixture.deleteOne({matchID:matchID});
          if(check.deletedCount>0){
              res.json({success:true,message:["successfully deleted fixture"]});
          }else{
              res.json({success:false,message:["fixture not found"]});
          }
           
          }
        }else{
            res.status(401).json({errors:["only admin or sub admin can access it"]})
        }
    }
}catch(err){
console.log(err);
res.status(500).json({errors:["something went wrong"]});
};
};


exports.editSeat=async (req,res,next)=>{
try{


    let user=await User.findOne({_id:req.userID});
    console.log(user.role);
    console.log(req.userID);
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})

    }
    else{ 
        if(user.role=="admin"||user.role=="sub-admin"){
      
    let {match_id,position,product_id,price,seat,sold} = req.body;
     console.log({match_id,position,product_id,price,seat,sold});
    let validator = new Validator({match_id,position,product_id,price,seat,sold},editSeatSchema);
    if(validator.passes()==false){
        res.status(422).json({errors:validator.errors.errors});
    }
    else{
     let productID=await mongoose.Types.ObjectId(product_id);
     let matchID=await mongoose.Types.ObjectId(match_id);
         
     var  fixture = await Fixture.findOne({
        matchID:matchID,    
        "seats.productID":productID,
         });
         
        if(fixture==null){
            res.status(422).json({errors:["seat not found !! wrong productID"]})
        }
        else{
            let index=await fixture.seats.findIndex(element=>element.productID==product_id);
            console.log(fixture.seats);
           let temp_arr=await fixture.seats;
  
              temp_arr[index].price=price; 
              temp_arr[index].seat=seat;
              temp_arr[index].position=position;
              temp_arr[index].sold=sold;
              console.log(temp_arr[index]);
              
              fixture.seats=temp_arr;

              fixture.markModified('seats')
             await fixture.save();
        
              res.send({success:true,message:"successfully edited the seat.",seat:fixture});
            
        }
       
          }
}
    }
}catch(err){
    console.log(err);
    res.status(500),json({errors:["something went wrong"]});
}
};


exports.deleteSeat=async (req,res,next)=>{
try{
   
        let user=await User.findOne({_id:req.userID});
    
        if(user==null){
            res.status(401).json({errors:["you are not authorized kindly login to continue"]})
        }else{

            if(user.role=="admin"||user.role=="sub-admin"){
      
        let {match_id,position,product_id} = req.body;
        let validator = new Validator({match_id,position,product_id},deleteSeatSchema);
        if(validator.passes()==false){
            res.status(422).json({errors:validator.errors.errors});
        }
        else{
         let productID=await mongoose.Types.ObjectId(product_id);
         let matchID=await mongoose.Types.ObjectId(match_id);
             let fixture;
      
          fixture = await Fixture.findOne({
            matchID:matchID,    
            "seats.productID":productID,
             });
    
            if(fixture==null){
                res.status(422).json({errors:["seat not found !! wrong productID"]})
                
            }
            else{
                console.log(fixture.seats);
                let Index=await fixture.seats.findIndex(element=>element.productID==product_id);
                console.log(fixture.seats);
      

                let temp_arr=await fixture.seats;
                console.log(temp_arr.length); 
              
              let  temp=await temp_arr.filter((item)=>{
                    console.log(item.productID)
                    console.log(item.productID!=product_id)
                    return item.productID!=product_id
                })
                console.log(temp.length); 
                console.log(temp.findIndex(element=>element.productID==product_id));

                  fixture.seats= temp;
    
                  fixture.markModified('seats')
                 await fixture.save();
                res.send({success:true,message:"successfully deleted the seat.",seat:fixture});
            }       
    }
}
else{
    res.status(401).json({errors:["only admin or sub admin can access it"]})
}
}
  
}catch(err){
    console.log(err);
    res.status(500).json({errors:["something went wrong"]});
}


}









