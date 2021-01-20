var express=require("express");
var app=express();
var user=require("../model/user");
var comment=require("../model/comment");
var mongoose=require("mongoose");
var router  = express.Router();
var middleware=require("../middleware/middleware");

router.get("/coffeehead/user",middleware.isLoggedIn,function(req,res){
  if(req.user){
    user.findOne({_id:req.user._id})
    .then(obj=>{
      console.log(obj);

      res.render("user/dashboard",{user:obj});
    })
    .catch(err=>{
      console.log(err);
    });
    console.log()
  }
  else{
    req.flash("error","You need to be logged in. ")
    res.redirect("/coffeehead/login");
  }
});
router.get("/coffeehead/user/edit",function(req,res){
  user.findOne({_id:req.user._id})
  .then(obj=>{

    res.render("user/edit",{user:obj});
  })
  .catch(err=>{

    req.flash("error",err.message);
    return res.redirect('back');
    console.log(err);
  });
});
router.post("/coffeehead/user",middleware.isLoggedIn,function(req,res){
  user.findOneAndUpdate({_id:req.user._id},
    {
      $set:{
        username:req.body.username,
        dob:req.body.dob
      }
    }
  )
  .then(obj=>{
    res.redirect("/coffeehead/user")
  })
  .catch(err=>{
    console.log(err);

        req.flash("error",err.message);
        return res.redirect('back');
  });

});

router.get("/coffeehead/user/changepassword",middleware.isLoggedIn, function(req, res) {
  res.render("user/changePass");
});

router.post('/coffeehead/user/changepassword',middleware.isLoggedIn, function(req, res) {

  user.findOne({_id:req.user._id})
          .then(foundUser => {
              foundUser.changePassword(req.body.oldPassword, req.body.newPassword)
                  .then(() => {
                      console.log('password changed');
                      req.flash("success","password change successful");
                      res.redirect("/coffeehead/user/");
                  })
                  .catch((error) => {

                      console.log(error);
                      req.flash("error",error.message);
                      return res.redirect('back');
                  })
          })
          .catch((error) => {

              console.log(error);
              console.log(error);
              req.flash("error",error.message);
              return res.redirect('back');

          });

});
router.post("/coffeehead/addbookmark",middleware.isLoggedIn,(req,res)=>{
console.log("the adding bookmark route");
console.log(req.body);
console.log(req.user);
var value= req.user.bookmarks.some(function(elem){
  return elem.url==req.body.url;
});
console.log(value);
  if(value){
      user.updateOne({_id:req.user._id},{
        $pull:{"bookmarks":{url:req.body.url}}
      }).then(a=>{
        console.log(a);
        return res.send({check:"no"})
      })
      .catch(err=>{
        console.log(err);
      });
  }
  else{var bookmark={
    title:req.body.title,
    url:req.body.url
  }
  user.findOne({_id:req.user._id}).then(obj=>{
    obj.bookmarks.push(bookmark);
    obj.save();
    res.send({check:"yes"});
  }).catch(err=>{console.log(err);});
}

});

module.exports=router;
