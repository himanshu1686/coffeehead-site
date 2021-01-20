var mongoose=require("mongoose");
var commentSchema=new mongoose.Schema({
  author:{
    name:{type:String,default:"Anonymous"},
    id:String,
    dp:{type:String,default:"https://www.sackettwaconia.com/wp-content/uploads/default-profile.png"}
  },
  commentText:String,
  replies:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"comment"
  }]
});
module.exports=mongoose.model("comment",commentSchema);
