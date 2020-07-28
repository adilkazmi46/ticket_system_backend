var ContactUs=require("../model/contactUs");
var Validator = require("validatorjs");
var nodeMailer =  require("../utils/nodeMailer");
var config = require("../config.json");
var constactUsSchema = {
    "email":"email|required",
    "phone": "numeric|required",
    "message":"string|required",
    "name": "string|required",

};


exports.contactUs=async (req,res,next)=>{

    try{
    let {name,email,phone,message} = req.body;

    let validator = new Validator({name,email,phone,message},constactUsSchema);
    if(validator.passes()==false){
        res.status(422).json({errors:validator.errors.errors});
    }
    else{
        let contactUs = new ContactUs({
            name:name, 
            email:email,
            phone:phone,
            message:message
        });
        let subject = "sample subject";
        await contactUs.save();
        await nodeMailer.SendEmail(email,config.From_Email,subject,message,"index");
        res.json({success:true,message:"email successfully sent"});
    }
    }catch(err){
        console.log(err);
        res.status(500).json({errors:["something went wrong"]});
    };
};