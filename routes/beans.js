var express=require("express");
var app=express();
var cbeans=require("../model/beans");
var comment=require("../model/comment");
var mongoose=require("mongoose");
var router  = express.Router();
var middleware=require("../middleware/middleware");


router.get("/coffeehead/beans",function(req,res){
  console.log("cofeeBeans");
  cbeans.find({})
  .then(obj=>{
    var liked=[];
    var x;
    if(req.user){
      obj.forEach(function(cofeeObj){
        x=cofeeObj.likeList.some(function(elem){
          return req.user._id.equals(elem);
        });
        if(x==true){
          liked.push("true");
        }
        else{
          liked.push("false");
        }
      });

      }
    res.render("coffeebeans",{allBeans:obj,liked:liked});
  })
  .catch(err =>{
    req.flash("error",err.message);
    res.redirect("/coffehead/beans");
    console.log(err);

   });
});
router.get("/coffeehead/beans/addnew",middleware.isAdmin,function(req,res){
  res.render("beans/new");
});

router.post("/coffeehead/beans",middleware.isAdmin,function(req,res){
  console.log("this is post route");
  let bean={
    beanName:req.body.beanName,
    origin:req.body.origin,
    likes:0
  }
  let array=req.body.images.split(";");
  bean.images=array;
  array=req.body.paragraphs.split(";");

  bean.paras=array;
console.log(bean);
cbeans.create(bean)
.then(obj=>{
  console.log(obj);
  return res.redirect("/coffeehead/beans");

} )
.catch(err=>{
  req.flash("error",err.message);

  res.redirect("/coffeehead");
  console.log(obj);
} );
});

router.get("/coffeehead/beans/:id",function(req,res){
  cbeans.findById(req.params.id).
  populate({
      path:"thisObjComments",
      model:"comment",
      populate:{
        path:"replies",
        model:"comment"
      }
  })
  .exec()
  .then(obj=>{ console.log(obj.thisObjComments);
    var liked="false";
    var check=undefined;var urlNow;
    if(req.user){

      liked=obj.likeList.some(function(elem){
        return req.user._id.equals(elem);
      });


      if(liked===true){
        liked="true";
      }
      urlNow=req.protocol + "://" + req.get('host') + req.originalUrl;
      check=req.user.bookmarks.some(function(elem){
        return elem.url==urlNow;
      });
    }
      console.log("liked",liked );


    res.render("beans/show",{bean:obj,liked:liked,checkbox:check}); })
  .catch(err =>{
    req.flash("error",err.message);
    res.redirect("/coffeehead");
    console.log(err);
  });
});

router.delete("/coffeehead/beans/:id",middleware.isAdmin,(req,res)=>{
console.log("delete bean" ,req.params);
var i,j;
cbeans.findOne({_id:req.params.id})
.then(foundBean=>{
console.log(foundBean);
  for(i=0;i<foundBean.thisObjComments.length;i++){
    console.log(foundBean.thisObjComments[i]);
    comment.findOne({_id:foundBean.thisObjComments[i]}).
    then(foundComment=>{
      for(j=0;j<foundComment.replies.length;j++){

        comment.findOne({_id:foundComment.replies[j]})
        .then(reply=>{
          console.log("reply",reply);
          reply.remove();
        })
        .catch(err=>{
          req.flash("error",err.message);
          res.redirect("/coffeehead");
        });
        }
      foundComment.remove();
      console.log("comment",foundComment);
    }).catch(err=>{
      req.flash("error",err.message);
      res.redirect("/coffeehead");
    });

  }
  console.log("foundBean",foundBean);
  foundBean.remove();
}).catch(err=>{
  req.flash("error",err.message);
  res.redirect("/coffeehead");
});
req.flash("success","Delete successful");
res.redirect("/coffeehead/beans");
});

router.delete("/coffeehead/beans/:beanId/:commentId",middleware.isLoggedIn,
middleware.rightOwnerComment,
(req,res)=>{
console.log("hit the comment delete route");
comment.findOne({_id:req.params.commentId}).then((foundComment)=>{
foundComment.replies.forEach(function(elem){
  comment.deleteOne({_id:elem})
  .then(()=>{}).catch();
});
//end of foreach
comment.deleteOne({_id:req.params.commentId}).then(()=>{
  cbeans.updateOne({_id:req.params.beanId},{
    $pull:{"thisObjComments":req.params.commentId}
  }).then(()=>{
      return res.redirect("/coffeehead/beans/"+req.params.beanId);
  }).catch( err=>{
    console.log(err);
    req.flash("error",err.message);
  return res.redirect("/coffeehead/beans/"+req.params.beanId);
});
}
).catch(err=>{
  console.log(err);
  req.flash("error",err.message);
return res.redirect("/coffeehead/beans/"+req.params.beanId);
});
})
.catch(err=>{
  console.log(err);
  req.flash("error",err.message);
return res.redirect("/coffeehead/beans/"+req.params.beanId);
});
return res.redirect("/coffeehead/beans/"+req.params.beanId);

});

router.post("/coffeehead/beans/:id/likes", function(req, res){
console.log(req.body);
if(req.body.isLiked=="false"){
	console.log("hit the req like route");
  cbeans.findOneAndUpdate({_id:req.params.id},{$inc:{likes:1}},{new:true})
  .then(obj=>{
    if(req.user){
      obj.likeList.push(req.user);
      console.log("pushed Object")
      obj.save();
    }
    console.log("the saved obj after incrementing like ",obj);
    res.send(obj);
  })
  .catch(err=>{
    req.flash("error",err.message);
    res.redirect("/coffeehead");
    console.log(err);
  });
}
else{
  console.log("post was not liked");
  cbeans.findOneAndUpdate({_id:req.params.id},{$inc:{likes:-1}},{new:true})
  .then(obj=>{
    if(req.user){
      var id=mongoose.Types.ObjectId(req.user._id);
      console.log("removing the user", id);
      cbeans.updateOne({_id:req.params.id},
        {
          $pull:{"likeList":req.user._id}
        }
      ).then(a=>{console.log("updated obj " ,a);}).catch(err=>{
        console.log(err);
        req.flash("error",err.message);
        res.redirect("/coffeehead");
      });;
    }
    console.log(obj);
    res.send(obj);
  })
  .catch(err=>{
    console.log(err);
    req.flash("error",err.message);
    res.redirect("/coffeehead");
  });
}

});

router.post("/coffeehead/beans/:id/addcomment",middleware.isLoggedIn,(req,res)=>{
  console.log("hit the add comment post route in beans");
  cbeans.findOne({_id:req.params.id})
    .then((foundObj)=>{
      console.log(foundObj);
      console.log(foundObj.thisObjectComments);
      comment.create(
        {
          author:{
          name:req.user.username,
          id:req.user._id,
          dp:req.user.dp
        },
          commentText:req.body.text
      }).then((newComment)=>{
        foundObj.thisObjComments.push(newComment);
        foundObj.save();
        return res.redirect("/coffeehead/beans/"+req.params.id);
      })
      .catch(err=>{
        req.flash("error",err.message);
        res.redirect("/coffeehead");
        console.log(err);
      });
    }).catch(err=>{
      req.flash("error",err.message);
      res.redirect("/coffeehead");
      console.log(err);
    });
});
router.delete("/coffeehead/beans/:beanId/:commentId/:replyId",middleware.isLoggedIn
,middleware.rightOwnerReply
,(req,res)=>{
  console.log("hit the delete reply route");
  console.log(req.params.replyId);
comment.updateOne({_id:req.params.commentId},{$pull:{"replies":req.params.replyId}})
.exec().then(c=>{console.log("c",c);
  var id=mongoose.Types.ObjectId(req.params.replyId);
  comment.findOne({_id:id}).then(foundReply=>{
    foundReply.remove();
  })
  .catch(err=>{
    console.log(err)
  req.flash("error",err.message);
  return res.redirect("/coffeehead/beans/"+req.params.beanId);
});
}
)
.then(obj=>{
  console.log(obj);
})
.catch(err=>{
  console.log(err);
  req.flash("error",err.message);
return  res.redirect("/coffeehead/beans/");
});

return res.redirect("/coffeehead/beans/"+req.params.beanId);
});

router.post("/coffeehead/beans/:beanId/:commentId/reply",middleware.isLoggedIn,(req,res)=>{

comment.findOne({_id:req.params.commentId},function(err,foundComment){
  if(!err){
    console.log(foundComment);
    comment.create({
      author:{name:req.user.username,
        id:req.user._id,
        dp:req.user.dp
      },
    commentText:req.body.text
    },function(err,newReply){
      console.log(newReply);
        if(!err){
            foundComment.replies.push(newReply);
            foundComment.save();
              res.redirect("/coffeehead/beans/"+req.params.beanId);
                  }
        else{
          console.log(err);
          req.flash("error",err.message);
          res.redirect("/coffeehead");
        }
    });
  }
  else{
    req.flash("error",err.message);
    res.redirect("/coffeehead");
    console.log(err)
  }
});
});

module.exports = router;
