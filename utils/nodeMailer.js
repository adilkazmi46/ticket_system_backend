var nodemailer = require("nodemailer");
var config = require("../config.json");
var Mailgun = require("nodemailer-mailgun-transport");
var hbs = require('nodemailer-express-handlebars');



const auth ={
    auth:{
        api_key:config.MailGun_API_KEY,
        domain:config.MailGun_Domain
    }
};






exports.SendEmail = async (to,from,subject,text) => {

    try{
let transporter = await nodemailer.createTransport(Mailgun(auth));

// await transporter.use("compile",hbs({
//     viewEngine:"express-handlebars",
//     viewPath: "../emailTemplates"
// }));
       let mailOptions = {
           from: from,
           to: to,
           subject:subject,
           text: text, 

       };

      await transporter.sendMail(mailOptions,async(res,err)=>{
       if(err){
           console.log(err);
       }
       else if(res.id){
           console.log(res);
           console.log("email sent");
       }
       });
 
    }catch(err){
        res.status(500).json({errors:["something went wrong"]});
    }

};