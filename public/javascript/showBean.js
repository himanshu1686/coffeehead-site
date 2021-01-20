$(document).ready(function(){
  $(".likeButton").click(function(e){
    e.preventDefault();
    var status=$(this).data("isliked");
    function updateLikes(result){
      console.log("update likes ",result);
      console.log(result.likes);
      console.log(result._id);
      var str="[data-beanid="+result._id+"]";
      $(str).toggleClass("buttonliked");
      if($(str).data("isliked")==true){
        $(str).data("isliked",false);
      }else{
        $(str).data("isliked",true);
      }
      var str2="#likes"+result._id;
      console.log(str2);
      //
      $(str2).text(result.likes);

    }
       $.ajax({
      type:"POST",
      url:"/coffeehead/beans/"+$(this).data("beanid")+"/likes",

      data:{
        isLiked:status
      },
      success:function(result){
        console.log("return working",result);
        updateLikes(result);
      }
    });
  });
  $(".btn1").click(function(){
    console.log("btn 1 clicked");
    console.log($(this).text());
      $(this).next(".replyform").slideToggle("medium");
  });
  $("#showhideCommentForm").click(function(){
    $("#commentForm").slideToggle("slow");
  });

  $("#bookmark").click(function(){

      console.log(document.URL);
      var curUrl=document.URL;
      var curtitle=$(".mainheading").text();
      $.ajax({
        type:"POST",
        url:"/coffeehead/addbookmark",
        data:{url:curUrl,title:curtitle},
        // success:function(res){
        //
        //   console.log(res);
        // }
      });
    });

});
