var mongoose = require("mongoose");
// pics schema
var productSchema = new mongoose.Schema({
    name : String,
    image : String,
    description: String,
    price : Number,
    category : String,
    quantity : Number,
    totalPrice :{type:Number ,default:0},
   created:{
      type:Date,default : Date.now()
   }
    });

module.exports = mongoose.model("Product",productSchema);