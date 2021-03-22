var express=require("express");
var app=express();
var drinks=require("../model/drink");
var comment=require("../model/comment");
var user=require("../model/user");
var mongoose=require("mongoose");
var router  = express.Router();
var middleware=require("../middleware/middleware");

router.get("/coffeehead/coffee",function(req,res){

  console.log("coffee route");
console.log(req.protocol + "://" + req.get('host') + req.originalUrl);
  drinks.find({}).
  then(obj=>{
    var liked=[];
    var x;
    console.log(obj)
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
      console.log( obj , liked  );
    res.render("coffee",{allcoffees:obj,liked:liked });
  })
  .catch(err=>{
    console.log(err);
    req.flash("error",err.message);
    return res.redirect("/coffeehead");
  } );
});
router.post("/coffeehead/coffee",middleware.isAdmin,function(req,res){
  console.log("this is post route");
  console.log(req.body);
  let coffee={
    coffeeName:req.body.coffeeName,
    likes:0,
    paras:[],
  }
  let array=req.body.images.split(";");
  coffee.images=array;
  array=req.body.steps.split(";");
  coffee.steps=array;
  array=req.body.paragraphs.split(";");
  var title=req.body.title.split(";");
  for(var i=0;i<title.length;i++){
    coffee.paras.push({title:title[i],text:array[i]});
    }
console.log(coffee);
drinks.create(coffee)
.then(obj=>{console.log(obj);
return res.redirect('/coffeehead');
})
.catch(err=>{
  console.log(err);
  req.flash("error",err.message);
   return res.redirect("/coffeehead");
});
});

router.get("/coffeehead/coffee/addnew",middleware.isAdmin,function(req,res){
  res.render("drinks/new");
});

router.get("/coffeehead/coffee/:id",function(req,res){
  drinks.findById(req.params.id).
  populate(
    {
      path:"thisObjComments",
      model:"comment",
      populate:{
        path:"replies",
        model:"comment"
      }
  }

)
  .exec()
  .then((obj)=>{
    var liked="false";var check=undefined;var urlNow;
    if(req.user){
      console.log(req.user);
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

    return res.render("drinks/show",{coffee:obj,liked:liked,checkbox:check});

  })
  .catch(err=>{
    console.log(err);
    req.flash("error",err.message);
    return res.redirect("/coffeehead");
  });
});
router.delete("/coffeehead/coffee/:id",middleware.isAdmin,(req,res)=>{
console.log("delete coffe" ,req.params);
var i,j,k;
drinks.findOne({_id:req.params.id})
.then(foundCoffee=>{
console.log(foundCoffee);
  for(i=0;i<foundCoffee.thisObjComments.length;i++){
    console.log(foundCoffee.thisObjComments[i]);
    comment.findOne({_id:foundCoffee.thisObjComments[i]}).
    then(foundComment=>{
      for(j=0;j<foundComment.replies.length;j++){

        comment.findOne({_id:foundComment.replies[i]})
        .then(reply=>{
          console.log("reply",reply);
          reply.remove();
        })
        .catch(err=>{
          console.log(err);
          req.flash("error",err.message);
        return   res.redirect("/coffeehead");

        });
        }
        console.log("comment",foundComment);
      foundComment.remove();
    }).catch(err=>{
      console.log(err);
      req.flash("error",err.message);
      return res.redirect("/coffeehead");

    });

  }
  console.log("foundCoffee",foundCoffee);
  foundCoffee.remove();
}).catch(err=>{
    console.log(err);
  req.flash("error",err.message);
  return res.redirect("/coffeehead");

});

req.flash("error",err.message);
return res.redirect("/coffeehead/coffee");
});

router.delete("/coffeehead/coffee/:coffeeId/:commentId",middleware.isLoggedIn,
// middleware.rightOwnerComment,
(req,res)=>{
console.log("hit the comment delete route");
comment.findOne({_id:req.params.commentId}).then((foundComment)=>{
foundComment.replies.forEach(function(elem){
  comment.deleteOne({_id:elem})
  .then(()=>{}).catch();
});
//end of foreach
comment.deleteOne({_id:req.params.commentId}).then(()=>{
  drinks.updateOne({_id:req.params.coffeeId},{
    $pull:{"thisObjComments":req.params.commentId}
  }).then(()=>{
      return res.redirect("/coffeehead/coffee/"+req.params.coffeeId);
  }).catch( err=>{
    console.log(err);
    req.flash("error",err.message);
  return res.redirect("/coffeehead/coffee/"+req.params.coffeeId);
});
}
).catch(err=>{
  console.log(err);
  req.flash("error",err.message);
return res.redirect("/coffeehead/coffee/"+req.params.coffeeId);
});
})
.catch(err=>{
  console.log(err);
  req.flash("error",err.message);
return res.redirect("/coffeehead/coffee/"+req.params.coffeeId);
});
return res.redirect("/coffeehead/coffee/"+req.params.coffeeId);

});

router.delete("/coffeehead/coffee/:coffeeId/:commentId/:replyId",middleware.isLoggedIn
,middleware.rightOwnerReply,(req,res)=>{
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
  return res.redirect("/coffeehead");
});
}
)
.then(obj=>{
  console.log(obj);
})
.catch(err=>{
  console.log(err);
  req.flash("error",err.message);
return  res.redirect("/coffeehead");
});

return res.redirect("/coffeehead/coffee/"+req.params.coffeeId);
});


router.post("/coffeehead/coffee/:id/likes", function(req, res){
console.log(req.body);
if(req.body.isLiked==="false"){
	console.log("hit the coffee like route  and is not liked ");
  drinks.findOneAndUpdate({_id:req.params.id},{$inc:{likes:1}},{new:true})
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
    console.log(err);
    req.flash("error",err.message);
    return res.redirect("/coffeehead");

  });
}
else{
  console.log("post was  liked and its else part so alerady liked");
  drinks.findOneAndUpdate({_id:req.params.id},{$inc:{likes:-1}},{new:true})
  .then(obj=>{console.log(obj);
    if(req.user){
      var id=mongoose.Types.ObjectId(req.user._id);
      console.log("removing the user", id);
      drinks.updateOne({_id:req.params.id},
        {
          $pull:{"likeList":req.user._id}
        }
      ).then(a=>{console.log("updated obj " ,a);}).catch(err=>{console.log(err);});;
    }
    res.send(obj);
  })
  .catch(err=>{
    console.log(err);

    req.flash("error",err.message);
    return res.redirect("/coffeehead");
});
}

});

router.get("/coffeehead/coffee/:id/addcomment",middleware.isLoggedIn,(req,res)=>{
  res.render("comment/addComment",{x:req.params.id});
});
router.post("/coffeehead/coffee/:id/addcomment",middleware.isLoggedIn,(req,res)=>{
  console.log("hit the add comment post route");
  drinks.findOne({_id:req.params.id})
    .then((foundObj)=>{
      console.log(foundObj);
      console.log(foundObj.thisObjectComments);
      comment.create(
        {
          author:{name:req.user.username},
          id:req.user._id,
          commentText:req.body.text
      }).then((newComment)=>{
        foundObj.thisObjComments.push(newComment);
        foundObj.save();
        return res.redirect("/coffeehead/coffee/"+req.params.id);
      })
      .catch(err=>{
        console.log(err);

        req.flash("error",err.message);
        return res.redirect("/coffeehead");

      });
    }).catch(err=>{
      console.log(err);

      req.flash("error",err.message);
      return res.redirect("/coffeehead");

    });

});



router.get("/coffeehead/coffee/:coffeId/:commentId/reply",middleware.isLoggedIn,(req,res)=>{
  var obj={
    coffeeId:req.params.coffeId,
    commentId:req.params.commentId
  }
  res.render("comment/addReply",{obj:obj});
});


router.post("/coffeehead/coffee/:coffeId/:commentId/reply",middleware.isLoggedIn,(req,res)=>{
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
              return res.redirect("/coffeehead/coffee/"+req.params.coffeId);
                  }
        else{console.log(err);}
    });
  }
  else{

    console.log(err)
    req.flash("error",err.message);
    return res.redirect("/coffeehead");

  }
});
});


module.exports=router;
