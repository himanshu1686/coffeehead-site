var express=require("express");
require("dotenv").config()
var app=express();
var mongoose=require("mongoose");
var user=require("./model/user");
var methodOverride=require("method-override");
// var bodyParser=require("body-parser");
var flash=require("connect-flash");
app.use(express.urlencoded({extended:false}));
app.use(express.json())
var passport=require("passport");
var cookieParser = require('cookie-parser');
var LocalStrategy=require("passport-local")
var GoogleStrategy=require("passport-google-oauth20");
var session = require('express-session');
var mongoURI=process.env.MONGO_ATLAS_URI;
console.log(mongoURI)
mongoose.connect(mongoURI
  ,{useNewUrlParser: true,
    dbName:'test',
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,}).then( obj =>{ console.log(obj) 
  console.log(" _______________________________ ");
    console.log(obj.connections[0].db.databaseName) }
    ).catch(err=>{console.log("mongo err") ; console.log(err); });
app.use(methodOverride("_method"));
var coffeeRoutes    = require("./routes/coffee");
var beansRoutes = require("./routes/beans");
var loginRoutes      = require("./routes/logins");
var userRoutes=require("./routes/user");

var path = require('path');

app.set("view engine","ejs");
app.use(flash());


app.use( express.static(path.join(__dirname, 'public')))
app.use(cookieParser("secret"));
app.use(session({
    secret: 'SomeSecretSentence',
    resave: false,
    saveUninitialized: false,
}));



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
  usernameField: 'email',
  usernameQueryFields: ['email']
},user.authenticate()));

// passport.use(
//     new GoogleStrategy({
//         clientID:process.env.GOOGLE_CLIENT_ID,
//         clientSecret:process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: "https://coffeehead-web-app.herokuapp.com/coffeehead/google/redirect/"
//     }, (accessToken, refreshToken, profile, done) => {
//         // check if user already exists in our own db
//         console.log("call back runs nw what?");
//         console.log('profile ', profile );

//         user.findOne({googleId: profile.id})
//         .then((currentUser) => {
//               if(currentUser){
//                 console.log('user is: ', currentUser);
//                 done(null,currentUser);
//                 } else {
//                 user.create({
//                     googleId: profile.id,
//                     username: profile.displayName,
//                     email:profile.emails[0].value
//                 }).
//                 then((newUser) => {
//                     console.log('created new user: ', newUser);
//                     done(null,newUser);
//                   }).catch((err)=>{
//                   console.log(err);
//                 });
//             }

//         }).catch((err)=>{
//         console.log(err);
//       });
//     })
// );

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use(
  function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");

    next();
  });
app.get("/coffeehead",function(req,res){
  console.log("cofeehead");
  res.render("landing");
});
app.get("/",function(req,res){
  console.log("cofeehead");
  res.render("landing");
});

app.get("/coffeehead/home",function(req,res){
  console.log("home");
  res.render("homepage");
});
app.use( beansRoutes);
app.use( loginRoutes);
app.use( coffeeRoutes);
app.use(userRoutes);

app.get("*",(req,res)=>{
  res.render("error/errorpage",{errorMessage:"Couldn't found what you were looking for " });
});

app.listen(process.env.PORT,function(){console.log(`listening on${process.env.PORT}`)});
