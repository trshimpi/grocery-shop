var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
// user schema
var userSchema = new mongoose.Schema({
    username:String,
    email : String,
    password:String,
    type : String,
    starMember:Boolean,
    products:[
        {
             type :mongoose.Schema.Types.ObjectId,
             ref :"Product",
             default:null
         },
         
        ],
    });
    
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);