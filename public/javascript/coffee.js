$(document).ready(function(){
  $(".likeButton").click(function(e){
    e.preventDefault();
    var status=$(this).data("isliked");
    function updateLikes(result){
      console.log("update likes ",result);
      console.log(result.likes);
      console.log(result._id);
      var str="[data-coffeeid="+result._id+"]";
      $(str).toggleClass("buttonliked");
      if($(str).data("isliked")==="true"){
        $(str).data("isliked","false");
      }else{
        $(str).data("isliked","true");
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
        console.log("return working",result);
        updateLikes(result);
      }
    });
  });
});
