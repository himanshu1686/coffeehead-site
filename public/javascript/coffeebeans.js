$(document).ready(function(){
  $(".likeButton").click(function(e){
    e.preventDefault();
    var status=$(this).data("isliked");
    console.log(status);
    function updateLikes(result){
      console.log("update likes ",result);
      console.log(result.likes);
      console.log(result._id);
      var str="[data-beanid="+result._id+"]";
      $(str).toggleClass("buttonliked");
      console.log($(str).text());
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
});
