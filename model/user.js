var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
  username:String,
  dp:{type:String,default:"https://www.sackettwaconia.com/wp-content/uploads/default-profile.png"},
  dob:{type:Date,default:Date.now()},
  email:String,
  googleId:String,
  gender:{type:String,default:"male"},
  isAdmin:{type:Boolean,default:false},
  bookmarks:[{
        title:String,
        url:String
  }],
  resetPassToken:String,
  resetPassTokenExpire:Date

});
userSchema.plugin(passportLocalMongoose,{ usernameField : 'email' });
module.exports=mongoose.model("user",userSchema);
