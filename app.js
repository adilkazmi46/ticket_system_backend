var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contactUSRouter = require("./routes/contactUs");
var subscriberRouter = require("./routes/subscriber");
var fixtureRouter = require("./routes/fixture");
var cors = require("cors");   
var mongoose = require("mongoose");
var config = require("./config.json");
var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use("/api/contact-us",contactUSRouter);
app.use("/api/subscriber",subscriberRouter); 
app.use("/api/fixture",fixtureRouter); 
console.log(config.MONGO_CONNECTION)
mongoose.connect(encodeURI(config.MONGO_CONNECTION),{useUnifiedTopology:true,useNewUrlParser:true}).then((res)=>{
    console.log("connected successfully");
}).catch((err)=>{
    console.log("errors:")
    console.log(err);
})

module.exports = app;
 