var mongoose=require("mongoose");
var coffeeSchema=new mongoose.Schema({
  coffeeName:String,
  steps:[String],
  likes:{type:Number,default:0},
  paras:[{title:String,text:String}],
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
module.exports=mongoose.model("drinks",coffeeSchema);
