//jshint esversion:6
//require("dotenv").config();
//const md5=require("md5");
//const bcrypt=require("bcrypt");
//const saltRounds=10;
const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
  secret:"Our Secret",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());





mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set("useCreateIndex",true);
const userSchema=new mongoose.Schema({
  userName:String,
  password:String,
  secret:String
});

userSchema.plugin(passportLocalMongoose);


//userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.get("/secrets",function(req,res){
  User.find({"secret":{$ne:null}},function(err,foundUsers){
    if(err)
    console.log(err);
    else
    if(foundUsers)
    {
      res.render("secrets",{userwithsecrets:foundUsers});
    }
  });
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});
app.get("/submit",function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");
  }
  else{
    res.redirect("/login");
  }
});
app.post("/submit",function(req,res){
  const submittedSecret=req.body.secret;
  User.findById(req.user.id,function(err,foundUser){
    if(err)
    console.log(err);
    else
    if(foundUser)
    {
      foundUser.secret=submittedSecret;
      foundUser.save(function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/register",function(req,res){
//   bcrypt.hash(req.body.password,saltRounds,function(err,hash){const user=new User({userName:req.body.username,
//   password:hash});
//   user.save(function(err){
//     if(err)
//     console.log(err);
//     else
//     res.render("secrets");
//   });
// });
User.register({username:req.body.username},req.body.password,function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }
  else{passport.authenticate("local")(req,res,function(){
    res.redirect("/secrets");
  });

  }
});


});

app.post("/login",function(req,res){
//   const username=req.body.username;
//   const password=req.body.password;
//   User.findOne({userName:username},function(err,foundUsers){
//     if(err)
//     console.log(err);
//     else
//     if(foundUsers)
//     bcrypt.compare(password,foundUsers.password,function(err,result){if(result===true)
//     res.render("secrets");
//     else
//   res.send("Sorry authentication failed");});
//   else
//   res.send("Sorry no users found");
//
//
//
//
// });
const user=new User({
  username:req.body.username,
  password:req.body.password
});
req.login(user,function(err){
  if(err){
    console.log(err);
  }
  else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});

});













app.listen(3000,function(){console.log("server started")});
