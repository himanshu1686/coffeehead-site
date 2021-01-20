// console.log("connected !")
$(document).ready(function(){
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


    $(".likeButton").click(function(e){
      e.preventDefault();
      var status=$(this).data("isliked");
      console.log(status);
      function updateLikes(result){
        var str="[data-coffeeid="+result._id+"]";
        $(str).toggleClass("buttonliked");
        console.log("before seeting" ,$(str).data("isliked"));
        if($(str).data("isliked")==true){
          $(str).data("isliked",false);
          console.log("Set to false",$(str).data("isliked"));

        }else{
          $(str).data("isliked",true);
          console.log("Set to true",$(str).data("isliked"));

        }
        var str2="#likes"+result._id;
        console.log(str2);
        //
        $(str2).text(result.likes);

      }

      $.ajax({
        type:"POST",
        url:"/coffeehead/coffee/"+$(this).data("coffeeid")+"/likes",

        data:{
          isLiked:status
        },
        success:function(result){
          updateLikes(result);
        }
      });
    });

        $(".btn1").click(function(){
          console.log("btn 1 clicked");
          console.log($(this).text());
            $(this).next(".replyform").slideToggle("medium");
        });


});
