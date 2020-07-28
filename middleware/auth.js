var jwt = require("jsonwebtoken");
const moment = require("moment");
const config = require("./../config.json");


exports.authenticate = (req,res,next)=>{
    if(!req.header("Authorization")){
        res.status(401).send({errors:["Please make sure your request has a autherization header"]});
    }
    else{
        let token = req.header("Authorization").split(" ")[1];
        let payload = null;
        try{
             payload = jwt.decode(token,config.TOKEN_SECRET);

        }catch(err){
            res.status(401).send({errors:[err.message]});
        }
        if(payload.exp<=moment().unix()){
            res.status(401).send({errors:["token has expired"]});
        }
        else{
            req.userID=payload.sub;
            next();
        }
    }
}

exports.createJWT = user=>{
    let payload = {
        sub : user._id,
        iat: moment().unix(),
        exp: moment().add(14 ,"days").unix()
    }
    return jwt.sign(payload,config.TOKEN_SECRET);
} 

exports.decodeJWT = token =>{
    return jwt.verify(token,config.TOKEN_SECRET);
}
