var User = require("../model/user");
var authMiddleware = require("../middleware/auth");
var Validator = require("validatorjs");

var bcrypt = require("bcryptjs");

var signupSchema = {
    "email" : "required|email",
    "password": "required|string|min:6|max:20|confirmed",
    "fullName": "required|string|min:3|max:15"
};
var signupAdminSchema = {
    "email" : "required|email",
    "password": "required|string|confirmed",
    
};

var signinSchema = {
    "email" : "required|email",
    "password" : "required|string"
};

var changePasswordSchema = {
    "oldPassword":"string|required",
    "newPassword":"string|required|confirmed"
};


var profileInfoSchema = {
    "fullName":"string|required",
    "email": "email|string",
    "userName": "string|required",
    "phone": "numeric|required",
    "profilePic":"required"
};

var shippingSchema = {
   "appartment":"string|required",
   "streetAddress":"string|required",
   "city":"string|required",
   "country":"string|required",
   "state":"string|required",
   "zip":"string|numeric|required"
};

var subAdminMakerSchema = {
   "email":"email|required"
};
exports.singup = async (req,res,next)=>{

    try{
  let {email,password,password_confirmation,fullName} = req.body;
  let validator=new Validator({email,password,password_confirmation,fullName},signupSchema);
  if(validator.passes()==false){
      console.log(validator.errors.errors)
      res.status(422).json({errors:validator.errors.errors});
  }else {
      let user = await User.findOne({email:email});
      
      if(user!=null){ 
          res.status(400).json({errors:["user already exists with this email"]});
      }
      else{
          user = new User({
              email:email,
              password:bcrypt.hashSync(password,10),
              role:"user",
              fullName:fullName,
          });
          await user.save();
          let token = await authMiddleware.createJWT(user);
          res.json({token:token,role:user.role});
      }
  }
}catch(err){
    console.log(err)
    res.status(500).json({errors:["something went wrong"]});
}
};

exports.signin = async (req,res,next) =>{

    try{
      let {email,password} = req.body;
      let user = await User.findOne({email:email});

      if(user == null) {
          res.status(404).json({errors:["user not found please try with a different email"]})
      }
      else{
         let validator = new Validator({email,password},signinSchema); 
         if(validator.passes()==false){
          res.status(422).json({errors:validator.errors.errors});
         }
         else{
          if(bcrypt.compareSync(password, user.password)){
           let token =await authMiddleware.createJWT(user);
            res.json({token:token,role:user.role});
          }
          else{
              res.status(422).json({errors:["incorrect password"]});
          }
        }
      }
    }catch(err){
        console.log(err)
        res.status(500).send({errors:["something went wrong"]});
    }
};

exports.changePassword=async (req,res,next)=>{

    try{
     
        let {oldPassword,newPassword,newPassword_confirmation} = req.body;

        let validator = new Validator({oldPassword,newPassword,newPassword_confirmation},changePasswordSchema);

        if(validator.passes()==false){
            res.status(422).json({errors:validator.errors.errors});
        }else{
            console.log(req.userID)
            let user = await User.findOne({_id:req.userID});
            if(user==null){
              res.status(401).json({errors:["invalid user id"]});
            }else{
        
              if(bcrypt.compareSync(oldPassword,user.password)){
                  
                user.password=bcrypt.hashSync(newPassword,10);
                await user.save();
                res.json({success:true,message:"successfully changed the password"});

              }else{
                  res.status(422).json({error:["old password incorrect"]});
              }
            }
        }


    }catch(err){
        console.log(err);
        res.status(500).json({errors:["something went wrong"]});
    }
};


exports.saveProfileInfo = async (req,res,next)=>{
try{



    let { fullName,email,userName,phone,profilePic } = req.body;
    let validator = new Validator({ fullName,email,userName,phone,profilePic },profileInfoSchema);
    if(validator.passes()==false){
        res.status(422).json({errors:validator.errors.errors});
    }else{
        let checkuserName= await User.findOne({userName:userName,email:{$ne:email}});
        if(checkuserName!=null){  
          res.status(422).json({errors:["username already exists"]});
        }
        else{
       let user = await User.findOne({_id:req.userID});
       let pic=req.file.location
       user.fullName=fullName;
       user.phone=phone;
       user.email=email;
       user.userName=userName,
       user.profilePic=pic
       await user.save();
       res.json({success:true,message:"successfully updated the info"});    
    }
}     
}catch(err){
    console.log(err);
    res.status(500).json({errors:["something went wrong"]});
}
};

exports.getProfileInfo = async (req,res,next) => {

    try{
        console.log(req.userID)
        let user = await User.findOne({_id:req.userID});
        console.log(user)
        if(user==null){
          res.status(401).json({errors:["invalid authentication token user is not authorized"]});
        }
        else{
           let profileInfo = {
               fullName:user.fullName,
               phone:user.phone,
               email:user.email,
               userName:user.userName,
               role:user.role
           }
           res.json({profileInfo:profileInfo});
        }

    }catch(err){
        console.log(err);
        res.status(500).json({errors:["something went wrong"]})
    }
};

exports.getAllUsers = async (req,res,next)=>{
    try{
      
        let user = await User.findOne({_id:req.userID});
        if(user.role=="admin"||user.role=="sub-admin"){
          let users = await User.find({role:"user"});
           res.json({users:users});
        }
        else{
            res.status(401).json({errors:["you can't access that information"]})
        }

    }
    catch(err){
        res.status(500).json({errors:["something went wrong"]});
    }
}

exports.getAllSubAdmins = async (req,res,next)=>{
    try{
      
        let user = await User.findOne({_id:req.userID});
        if(user.role=="admin"){
          let users = await User.find({role:"sub-admin"});
           res.json({users:users});
        }
        else{
            res.status(401).json({errors:["you can't access that information"]})
        }

    }
    catch(err){
        res.status(500).json({errors:["something went wrong"]});
    }
}


exports.saveShippingInfo=async (req,res,next)=>{

    try{
        let {appartment,streetAddress,city,country,state,zip} = req.body;
        let validator = new Validator({appartment,streetAddress,city,country,state,zip},shippingSchema);

        if(validator.passes()==false){
            res.status(422).json({errors:validator.errors.errors});
        }else{
          let user = await User.findOne({_id:req.userID});
          if(user==null){
              res.status(401).json({errors:["Invalid token user not authorized to access information"]});
          }
          else{
              user.appartment=appartment;
              user.streetAddress=streetAddress;
              user.state=state;
              user.city=city;
              user.country=country;
              user.zip=zip;

            await  user.save();

            res.json({success:true,
                message:"successfully saved shipping information"});
          }
        };
      
    }catch(err){
        console.log(err);
        res.status(500).json({errors:["something went wrong"]});
    }

};

exports.getShippingInfo = async (req,res,next)=> {
    try{
        let user = await User.findOne({_id:req.userID});
        if(user==null){
          res.status(401).json({errors:["invalid authentication token user is not authorized"]});
        }
        else{
           let shippingInfo = {
               appartment:user.appartment, 
               streetAddress:user.streetAddress,
               city:user.city,
               state:user.state,
               country:user.country,
               zip:user.zip
           }
           res.json({shippingInfo:shippingInfo});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({errors:["something went wrong"]});
    }
}

exports.contactUs = (req,res,next) => {
try{

}
catch(err){
    res.status(500).send({errors:["something went wrong"]});
}
};

exports.signupAdmin = async (req,res,next)=>{
    try{
        let {email,password,password_confirmation} = req.body;
        let validator=new Validator({email,password,password_confirmation},signupAdminSchema);
        if(validator.passes()==false){
            console.log(validator.errors.errors)
            res.status(422).json({errors:validator.errors.errors});
        }else {
            let user = await User.findOne({email:email});
            
            if(user!=null){ 
                res.status(400).json({errors:["user already exists with this email"]});
            }
            else{
                user = new User({
                    email:email,
                    password:bcrypt.hashSync(password,10),
                    role:"admin",
                });
                await user.save();
                let token = await authMiddleware.createJWT(user);
                res.json({token:token,role:user.role});
            }
        }
      }catch(err){
          console.log(err)
          res.status(500).json({errors:["something went wrong"]});
      }
};

exports.sub_admin_maker=async (req,res,next)=>{
try{
let user = await User.findOne({_id:req.userID});
if(user.role=="admin"){
let {email}=req.body;
let validator= new Validator({email},subAdminMakerSchema);
if(validator.passes()==false){
res.status(422).json({errors:validator.errors.errors});
}
else{
let sub_admin=await User.findOne({email:email,role:"user"});
if(sub_admin==null){
    res.status(404).json({errors:["user not found try another email"]});
}
else{
sub_admin.role="sub-admin";
await sub_admin.save();
res.json({success:true,message:"successfully maked the user sub-admin"});
}
}
}
else{
    res.status(401).json({errors:["You can't access the data, Only admin is allowed to make a sub admin"]});
}
}catch(err){
console.log(err);
res.status(500).json({errors:["something went wrong"]});
};
};


exports.user_maker=async (req,res,next)=>{
    try{
    let user = await User.findOne({_id:req.userID});
    if(user.role=="admin"){
    let {email}=req.body;
    let validator= new Validator({email},subAdminMakerSchema);
    if(validator.passes()==false){
    res.status(422).json({errors:validator.errors.errors});
    }
    else{
    let sub_admin=await User.findOne({email:email,role:"sub-admin"});
    if(sub_admin==null){
        res.status(404).json({errors:["user not found try another email"]});
    }
    else{
    sub_admin.role="user";
    await sub_admin.save();
    res.json({success:true,message:"successfully maked sub-admin the user"});
    }
    }
    }
    else{
        res.status(401).json({errors:["You can't access the data, Only admin is allowed to make sub admin a user"]});
    }
    }catch(err){
    console.log(err);
    res.status(500).json({errors:["something went wrong"]});
    };
};

exports.deleteUser = async (req,res,next)=>{
    try{
        let user = await User.findOne({_id:req.userID});
        if(user.role=="admin"||user.role=="sub-admin"){
        let {email}=req.body;
        let validator= new Validator({email},subAdminMakerSchema);
        if(validator.passes()==false){
        res.status(422).json({errors:validator.errors.errors});
        }
        else{
        let user=await User.deleteOne({email:email,role:"user"});
        if(user.deletedCount>0){
            res.json({success:true,message:["successfully deleted user"]});
        }else{
            res.json({success:false,message:["user not found"]});
        }
       
        }
        }
        else{
            res.status(401).json({errors:["You can't access the data, Only admin is allowed to make sub admin a user"]});
        }
        }catch(err){
        console.log(err);
        res.status(500).json({errors:["something went wrong"]});
        };
};