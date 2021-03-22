
var mongoose=require("mongoose");
var beansSchema=new mongoose.Schema({
  beanName:String,
  origin:{type:String,default:"NA"},
  likes:{type:Number,default:0},
  paras:[String],
  images:[String],
  thisObjComments:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"comment"
    }
  ],
  likeList:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"user"
    }
  ]
});
module.exports=mongoose.model("cbean",beansSchema);
