var express=require("express");
var app=express();
var user=require("../model/user");
var passport=require("passport");
var router  = express.Router();
var cloudinary = require('cloudinary');
var multer=require("multer");
var crypto=require("crypto");
var nodemailer=require("nodemailer");
var middleware=require("../middleware/middleware");

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
  router.get("/coffeehead/register",(req,res)=>{
    res.render("login/registerpage");
});

router.post("/coffeehead/registeruser",upload.single('image'),async (req,res)=>{
  var newUser ={
    username:req.body.username,
    email:req.body.email,
    date:req.body.date

  };
  var imgUrl;
  console.log(req.body);
  if(req.file){
    console.log(req.file);
    var result= await cloudinary.uploader.upload(req.file.path);
    newUser.dp=result.secure_url;
  }
  user.register(newUser,req.body.password,(err,obj)=>{
    if(err){
      req.flash("error",err.message);
      return res.redirect("/coffeehead/register");
    }
    else{
      passport.authenticate("local")(req, res, function(){

          return  res.redirect("/coffeehead");
        });
    }
  });

});

router.get("/coffeehead/login", function(req, res){
   res.render("login/loginpage");
});

router.post("/coffeehead/login", passport.authenticate("local",
    {
      session:true,
        successRedirect: "/coffeehead",
        failureRedirect: "/coffeehead/login",
        failureFlash : true
    }), function(req, res){
});

router.get("/coffeehead/login/forgotpassword",(req,res)=>{
  res.render("user/forgotpass");
});
router.post("/coffeehead/user/forgotpassword",(req,res)=>{
try{
var buf=crypto.randomBytes(20);

console.log(buf);
var token=buf.toString("hex");
console.log(token);
user.findOne({email:req.body.email})
.then(foundUser=>{
  foundUser.resetPassToken=token;
  foundUser.resetPassTokenExpire=Date.now()+3600000;
foundUser.save();
})
.catch(err=>{
  console.log(err);

  req.flash("error",err.message);
  return res.redirect("/coffeehead");

  });
var smtpTransport = nodemailer.createTransport({
       service: 'Gmail',
       auth: {
         user: process.env.MY_EMAIL,
         pass: process.env.MY_PASS
       }
     });
     var mailOptions = {
        to:req.body.email,
        from:process.env.MY_EMAIL,
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/coffeehead/resetpassword/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
              console.log('mail sent');
            });
            res.redirect("/coffeehead")
}
catch (err){
  console.log(err);
  req.flash("error",err.message);
  return res.redirect("/coffeehead");

}

});
router.get("/coffeehead/resetpassword/:token",(req,res)=>{
  user.findOne({ resetPassToken: req.params.token, resetPassTokenExpire: { $gt: Date.now() } }, function(err, foundUser) {
  if (!foundUser) {

    req.flash("error","Can't find User");
    return res.redirect("/coffeehead");
  }

  res.render('login/reset', {token: req.params.token});
  });

});
router.post("/coffeehead/resetpassword/:token",(req,res)=>{
  user.findOne({ resetPassToken: req.params.token
    , resetPassTokenExpire: { $gt: Date.now() }
  }).then(foundUser=>{
    if (!foundUser) {
      console.log("foundUser",foundUser);
      req.flash("error",err.message);
      return res.redirect("/coffeehead");
      req.flash("error","Password reset token is invalid or has expired.");
        return res.redirect('back');
      }
      if(req.body.newPassword === req.body.confirm) {
          foundUser.setPassword(req.body.newPassword, function(err) {
            foundUser.resetPassToken = undefined;
            foundUser.resetPassTokenExpire = undefined;

            foundUser.save(function(err) {
              req.logIn(foundUser, function(err) {
                  if(err){console.log(err);}
                  var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASS
        }
      });
      var mailOptions = {
        to: foundUser.email,
        from: process.env.MY_EMAIL,
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + foundUser.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log("mail of password changed sent");
        req.flash("success","Mail of password changed sent, for gmail user allow lesser secure apps to gain access to aforementioned email");
      });
                  return res.redirect("/coffeehead")
              });
            });
          });
        } else {
            console.log("Passwords do not match.");
            req.flash("error","passwords do not match")
            return res.redirect('back');
        }
  })
  .catch(err=>{
    console.log(err);

    req.flash("error","passwords do not match")
    return res.redirect('back');
  })
});

router.get("/coffeehead/logout", function(req, res){
  console.log("logged out");

   req.logout();
   req.flash("success","Logout Successful");
   res.redirect("/coffeehead");
});

router.get('/coffeehead/googlelogin', passport.authenticate('google', {
    scope: ['email','profile']

}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/coffeehead/google/redirect', passport.authenticate('google'), (req, res) => {
    req.flash("success","logged in with your gmail accout ");
    res.redirect('/coffeehead');
});
module.exports = router;
