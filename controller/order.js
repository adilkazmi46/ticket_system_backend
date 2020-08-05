var stripe=require("stripe")("sk_test_z5J420Hdvd27YlXDAiu4WfZy");
var uuid = require("uuid");
var User=require("../model/user");
var Order = require("../model/order");
var Validator = require("validatorjs");
var Fixture = require("../model/fixture");
var mongoose = require("mongoose");
const order = require("../model/order");
let seatSchema = {
    "productID":"required",
    "seat": "string|required",
    "price": "numeric|required",
    "sold": "boolean|required",
    "position":"string|required"
};
let orderSchema = {
    "data":"required",
    "details":"required",
    "matchID":"required",
    "seats":"required"
}

let deleteOrderSchema={
"orderID":"required"
};

let editOrderSchema = {
    "orderID":"required",
     "matchID":"required",
     "time":"required",
     "address":"required",
     "currency":"required"
}



exports.payPalTransactionComplete=async (req,res,next)=>{

    try{
         let user =await User.findOne({_id:req.userID});
        if(user==null){
            res.status(401).json({errors:["user not found kindly login"]});
        }
        else{

        
        
         let {data,details,seats,matchID} = req.body;
         

          let validator = new Validator({data,details,seats,matchID},orderSchema);
          if(validator.passes()==false){
              res.status(422).json({errors:validator.errors.errors});
          }
          else{
            
            for(var i=0;i<seats.length;i++){
             
           if(seats[i].position=="longSideLower"||seats[i].position=="longSideUpper"||seats[i].position=="awayEnd"||seats[i].position=="behindGoal")
           {  
                let seatValidator = new Validator(seats[i],seatSchema);
                console.log(seats[i]);
                if(seatValidator.passes()==false){
                    res.status(422).json({errors:["invalid seats data"]});
                    return;
                 }    
                }
                else{
                    res.status(422).json({errors:["invalid seats data"]});
                    return;
                }
               
            }

              let fixture=await Fixture.findOne({
                  matchID:matchID,
                  "seats.sold":false,
                  "seats.productID":{
                    "$all":seats.map(x=>mongoose.Types.ObjectId(x.productID))
                 }
              });
              console.log("database seats");
              console.log(fixture);

              if(fixture==null){
                  res.status(404).json({errors:["Invalid seats or fixture or already sold"]});
                  return;
              }
              else{
              
              let tmp_seats=fixture.seats;
            
              for(let i=0;i<Object.keys(seats).length;i++){
                await tmp_seats.forEach(element => {
                    if(element.productID==seats[i].productID){
                        element.sold=true;
                        seats[i].sold=true;
                        console.log("sold changed:"+element.sold)
                    }

                });          
            } 
            console.log("line 85:-----------") 
            console.log(tmp_seats);
            fixture.seats=null;
               fixture.seats=await [...tmp_seats];  
             await  fixture.save();
           console.log(details)
           console.log(details.purchase_units)
            let order =await new Order({
                orderID:data.orderID,
                payerID:data.payerID,
                products:seats,
                ammount:details.purchase_units[0].amount.value,
                currency:details.purchase_units[0].amount.currency,
                matchID:await fixture.matchID,
                date:await fixture.date,
                time:await fixture.time,
                category:await fixture.category,
                subCategory:await fixture.subCategory,
                user_id:await user._id,
                user_email:await user.email,
                address:details.payer.address
              });
              await order.save();
              res.json({order})
        }    
}}}
catch(err){
        console.log(err);
          res.status(500).json({errors:["something went wrong"]});
    }
}


exports.getAllOrders=async (req,res,next)=>{
try{

    let user=await User.findOne({_id:req.userID});
    console.log(user.role);
    console.log(req.userID);
    if(user==null){
        res.status(401).json({errors:["you are not authorized kindly login to continue"]})
    }else{
        if(user.role=="admin"||user.role=="sub-admin"){
            let orders=await Order.find();
            res.json({orders});
        }
    }

}catch(err){
    res.status(500).json({errors:["something went wrong"]});
}
};

exports.getMyOrders = async (req,res,next)=>{
    try{

        let user=await User.findOne({_id:req.userID});
        console.log(user.role);
        console.log(req.userID);
        if(user==null){
            res.status(401).json({errors:["you are not authorized kindly login to continue"]})
        }else{
            
                let orders=await Order.find({user_email:user.email});
                res.json({orders});
            
        }
    
    }catch(err){
        res.status(500).json({errors:["something went wrong"]});
    }   
}


exports.deleteOrder = async (req,res,next)=>{
    try{

        let user=await User.findOne({_id:req.userID});
        console.log(user.role);
        console.log(req.userID);
        let {orderID} = req.body;

        if(user==null){
            res.status(401).json({errors:["you are not authorized kindly login to continue"]})
        }else{
            let validator = new Validator({orderID},deleteOrderSchema);
            if(validator.passes()==false){
                res.status(422).json({errors:validator.errors.errors});
            }
            else{
              if(user.role=="admin"||user.role=="sub-admin"){
                let order=await Order.deleteOne({orderID:orderID});
                if(order.deletedCount>0){
                    res.json({success:true,message:["successfully deleted fixture"]});
                }else{
                    res.json({success:false,message:["orders not found"]});
                }
               
            }else{
                res.status(401).json({errors:["you are not authorized to do it, Only admin or sub admin can delete order"]});
            }
        }
        }
    
    }catch(err){
        res.status(500).json({errors:["something went wrong"]});
    }   
}


exports.editOrder = async (req,res,next)=>{
    try{

        let user=await User.findOne({_id:req.userID});
        console.log(user.role);
        console.log(req.userID);
        let {orderID,matchID,time,address,products,ammount,currency} = req.body;
        console.log({orderID,matchID,time,address,products,ammount,currency})
        if(user==null){
            res.status(401).json({errors:["you are not authorized kindly login to continue"]})
        }else{
            console.log("hello 224")
            let validator = new Validator({orderID,matchID,time,address,products,ammount,currency},editOrderSchema);
            console.log(validator.passes());
            if(validator.passes()==false){
                res.status(422).json({errors:validator.errors.errors});
            }
            else{
             
              if(user.role=="admin"||user.role=="sub-admin"){
                  console.log("230")
                let order=await Order.findOne({orderID:orderID});
                console.log(order);
                if(order==null){
                    res.status(404).json({errors:["invalid order id"]});
                }else{

                    order.time=time;
                    order.address=address;
                    order.products=products;
                    order.ammount=ammount;
                    order.currency=currency;
                    
                   await  order.save();
                res.json({order,message:"successfully edited the order"});
                }
                
            }else{
                res.status(401).json({errors:["you are not authorized to do it, Only admin or sub admin can delete order"]});
            }
        }
        }
    
    }catch(err){
        res.status(500).json({errors:["something went wrong"]});
    }   
}

