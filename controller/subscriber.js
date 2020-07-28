var Subscriber = require("../model/subscriber");
var nodeMailer = require("../utils/nodeMailer");
var User = require("../model/user");
var config = require("../config.json");
var Validator = require("validatorjs")
let subscriberSchema = {
    "email":"required|email"
};

let emailSubscriber = {
    "text":"required|string",
    "message":"required|string",
 
}

exports.addSubscriber = async (req,res,async) => {
try{
    let {email} = req.body;
   let validator=new Validator({email},subscriberSchema);
   if(validator.passes()==false){
       res.status(422).json({errors:validator.errors.errors});
   }
   else{
       let subscriber=new Subscriber({
           email:email
       });
          await subscriber.save();       
          res.send({success:true,message:"successfully subscribed"});
   }
}
catch(err){
    console.log(err);
    res.status(500).json({errors:["something went wrong"]});
}
};


exports.emailToSubscribers=async(req,res,next)=>{
try{
    let {message,subject}=req.body;
    let user=await User.findOne({_id:req.userID});
    if(user==null){
        res.status(401).json({errors:["unauthorised user!"]});
    }
    else if(user.role!="admin" || user.role=="sub admin"){
        res.status(401).json({errors:["only admin or sub admin can send emails"]});
    }
    else{
        let validator = new Validator({message,subject},emailSubscriber);
        if(validator.passes()==false){
           res.status(422).json({errors:validator.errors.errors});
        }
        else{
            let subscribers= await Subscriber.find();
            nodeMailer.SendEmail(subscribers,config.From_Email,subject,text,message);
            res.send({success:true,message:"sending emails"});
        }
    } 
}catch(err){
    console.log(err);
    res.status(500).json({errors:["something went wrong"]});
}
};