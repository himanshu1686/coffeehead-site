let middleware={};
var comment=require("../model/comment");
middleware.isLoggedIn=function(req,res,next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    req.flash("error","Login required");
    return res.redirect("/coffeehead/login")
  }
}
middleware.isAdmin=function(req,res,next){
  if(req.isAuthenticated()){
    if(req.user.isAdmin){
      next();
    }
    else{
      req.flash("error","Admin Login Required");
      return res.redirect("/coffeehead/login");
    }
  }
  else{
    req.flash("error","Admin Login required");
    return res.redirect("/coffeehead/login")
  }
}
middleware.rightOwnerReply=function(req,res,next){
  comment.findOne({_id:req.params.replyId}).then(foundReply=>{
    console.log("foundReply",foundReply);
    console.log(req.user);
    if(req.user._id.equals(foundReply.author.id)){
      next();
    }
    else{
      req.flash("error","Not right owner ");
      return res.redirect("/coffeehead/login");
    }
  }).catch(err=>{
    req.flash("error",err.message);
    return res.redirect("/coffeehead/login");
  });
}
middleware.rightOwnerComment=function(req,res,next){
  comment.findOne({_id:req.params.commentId}).then(foundComment=>{
    console.log("foundComment",foundComment);
    if(req.user._id.equals(foundComment.author.id)){
      next();
    }
    else{
      req.flash("error","Not right owner ");
      return res.redirect("/coffeehead/login");
    }
  }).catch(err=>{
    req.flash("error",err.message);
    return res.redirect("/coffeehead/login");
  });
}
module.exports=middleware;
