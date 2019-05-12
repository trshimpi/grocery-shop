var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    User = require("./models/user.js"),
    Product = require("./models/product.js"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    flash = require("connect-flash"),
    methodOverride = require("method-override");

mongoose.connect("mongodb://localhost/grocery_shop",{ useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine","ejs");

//flash messages
app.use(flash());

//passport config
//tell express to use passport
app.use(require("express-session")({
    secret:"i love my INDIA , ye mera INDIA ,ha maza BHARAT",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.error       = req.flash("error");
  res.locals.success     = req.flash("success");
   next();
});

app.get("/",function(req,res){
    res.render("landing");    
});

app.get("/admin",function(req,res){
    res.render("landing");    
});


// search route
app.post("/search",function(req, res) {
   var productName = req.body.product; 
   Product.find({name:productName},function(err, matchedProduct) {
       if(err){
           console.log(err);
       }else{
           res.render("normalUser/products",{products:matchedProduct});
       }
   });
});


// showing all products to admin
app.get("/admin/products",function(req,res){
   Product.find({},function(err,allProducts){
       if(err){
           console.log(err);
       } else{
           res.render("product/products.ejs",{products:allProducts});
       }
    }); 
});

// new product get route
app.get("/admin/products/new",function(req, res) {
    res.render("product/newProduct");
});

//create product
app.post("/admin/products",function(req,res){
  // get data from form and add to products array
    var name = req.body.name;
    var price=req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var ctg = req.body.category;
    var newProduct  = {name: name, image: image, description: desc, category:ctg , price:price};
    // Create a new campground and save to DB
    Product.create(newProduct, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/admin/products");
        }
    });
   
});

// SHOW - shows more info about one product
app.get("/admin/products/:id", function(req, res){
    //find the campground with provided ID
    Product.findById(req.params.id,function(err, foundProduct){
        if(err || !foundProduct){
            req.flash("error","Product not found");
            res.redirect("back");
        } else {
            console.log(foundProduct);
            //render show template with that campground
            res.render("product/showProduct", {product: foundProduct});
        }
    });
});

//edit route
app.get("/admin/products/:id/edit",function(req,res){
    Product.findById(req.params.id,function(err,foundproduct){
        if(err){
            res.redirect("back");
        }else{
            res.render("product/editProduct",{product:foundproduct});
        }
    });
});


//update route
app.put("/admin/products/:id",function(req,res){
    //find and update the edited product
    // var ide = req.params.id;
    Product.findByIdAndUpdate(req.params.id,req.body.product,function(err,updatedProduct){
        if(err){
            req.flash("error","Error updating product");
            res.redirect("/admin/products");
        }else{ 
            req.flash("success","Successfully updated product");
            res.redirect("/admin/products");
        }
    });
});

//destroy route
app.delete("/admin/products/:id",function(req,res){
  //find the pic and delete
  Product.findByIdAndRemove(req.params.id,function(err){
      if(err){
          req.flash("error","error deleting picture");
          res.redirect("/admin/products/");
      }else{
          req.flash("success","Successfully deleted product");
          res.redirect("/admin/products/");
      }
  });
// res.send("you hit delete route");
});

// ===================================
// User routes
// ===================================
// showing all users to admin
app.get("/admin/users",function(req,res){
   User.find({},function(err,allUsers){
       if(err){
           console.log(err);
       } else{
           res.render("user/index.ejs",{users:allUsers});
       }
    }); 
});

// new product get route
app.get("/admin/users/new",function(req, res) {
    res.render("register");
});



// get star members
app.get("/admin/users/star",function(req, res) {
      User.find({starMember:true},function(err,starUsers){
       if(err){
           console.log(err);
       } else{
           res.render("user/index.ejs",{users:starUsers});
       }
    }); 
});

// // SHOW - shows more info about one product
// app.get("/admin/users/:id", function(req, res){
//     //find the campground with provided ID
//     User.findById(req.params.id,function(err, foundUser){
//         if(err || !foundUser){
//             req.flash("error","Product not found");
//             res.redirect("back");
//         } else {
//             console.log(foundProduct);
//             //render show template with that campground
//             res.render("user/showUser", {product: foundUser});
//         }
//     });
// });

//edit route
app.get("/admin/users/:id/edit",function(req,res){
    User.findById(req.params.id,function(err,foundUser){
        if(err){
            res.redirect("back");
        }else{
            res.render("user/editUser",{user:foundUser});
        }
    });
});


//update route
app.put("/admin/users/:id",function(req,res){
    //find and update the edited product
    // var ide = req.params.id;
    User.findOne({_id:req.params.id},function(err,foundUser){
        // console.log(foundUser);
        if(err){
            req.flash("error","Error updating user info");
            res.redirect("/admin/users");
        }else{ 
            foundUser.username = req.body.user.username;
            foundUser.email = req.body.user.email;
            foundUser.starMember = req.body.user.starMember;
            foundUser.save(function(err){
                if(err){
                    console.log("error saving user");
                      req.flash("error","Error updating user info");
                        res.redirect("/admin/users");   
                }else{
                    
                    req.flash("success","Successfully updated user info");
                    res.redirect("/admin/users");   
                }
            });
            // console.log(foundUser);
        }
    });
});

//destroy route
app.delete("/admin/users/:id",function(req,res){
  //find the pic and delete
  User.findOneAndRemove({_id:req.params.id},function(err){
      if(err){
          req.flash("error","error deleting user.");
          res.redirect("/admin/users/");
      }else{
          req.flash("success","Successfully deleted user.");
          res.redirect("/admin/users/");
      }
  });
// res.send("you hit delete route");
});

// =================================================
// User routes
// =================================================
app.get("/products",function(req, res) {
     Product.find({},function(err,allProducts){
       if(err){
           console.log(err);
       } else{
           res.render("normalUser/products",{products:allProducts});
       }
    }); 
});

app.get("/products/fruits",function(req, res) {
     Product.find({category:"Fruit"},function(err,allProducts){
       if(err){
           console.log(err);
       } else{
           res.render("normalUser/products",{products:allProducts});
       }
    }); 
});

app.get("/products/vegetables",function(req, res) {
     Product.find({category:"Vegetable"},function(err,allProducts){
       if(err){
           console.log(err);
       } else{
           res.render("normalUser/products",{products:allProducts});
       }
    }); 
});
app.get("/products/pulses",function(req, res) {
     Product.find({category:"Pulses"},function(err,allProducts){
       if(err){
           console.log(err);
       } else{
           res.render("normalUser/products",{products:allProducts});
       }
    }); 
});

app.get("/products/beverages",function(req, res) {
     Product.find({category:"Beverages"},function(err,allProducts){
       if(err){
           console.log(err);
       } else{
           res.render("normalUser/products",{products:allProducts});
       }
    }); 
});

app.get("/products/packagedFood",function(req, res) {
     Product.find({category:"Packaged Food"},function(err,allProducts){
       if(err){
           console.log(err);
       } else{
           res.render("normalUser/products",{products:allProducts});
       }
    }); 
});

// ================================================
// Cart routes
// ================================================
app.get("/user/cart",function(req, res) {
    var userid = req.user._id;
    
    //find the campground with provided ID
    User.findById(userid).populate("products").exec(function(err, foundUser){
        if(err || !foundUser){
            req.flash("error","User not found");
            res.redirect("back");
        } else {
            console.log(foundUser);
            //render show template with that campground
            res.render("normalUser/cart", {user: foundUser});
        }
    });
});

app.post("/user/cart",function(req, res) {
   User.findById(req.user._id,function(err, foundUser) {
       if(err){
           console.log(err);
       }else{
        //   find the product to add
        Product.findById(req.body.productid,function(err, foundproduct) {
            if(err){
                console.log(err);
            }else{
                // console.log("user");
                // console.log(foundUser);
                // console.log("product");
                // console.log(foundproduct);
                var id = foundproduct._id
                var name = foundproduct.name;
                var image = foundproduct.image;
                var price = foundproduct.price;
                var category = foundproduct.category;
                var number = foundproduct.quantity;
                var newProduct = {name:name,image:image,price:price,category:category,_id:id,quantity:number};
                foundUser.products.push(newProduct);
                foundUser.save();
                // console.log(foundUser);
                
                res.redirect("/user/cart");
            }
        });
       }
   }) ;
});

//destroy route
app.delete("/user/cart/:id",function(req,res){
  //find the pic and delete
  var product = Product.findOne({_id:req.params.id});
    console.log(product.name);
      
    User.updateOne({_id:req.user._id},{ $pull :{products:req.params.id}},function(err, foundUser) {
      if(err){
          console.log(err);
      }  else{
        //   console.log("founduser after pull"+foundUser);
          req.flash("success","Removed product from cart");
          res.redirect("/user/cart");
      }
    }) ;
});
// =================================================
// auth routes
// =================================================
//login form
app.get("/login",function(req,res){
    res.render("login");
});

//auth routes
//show sign up form
app.get("/register",function(req,res){
    res.render("register");
});

//sign up logic
app.post("/register",function(req,res){
   var newUser = new User ({username : req.body.username,email:req.body.email,starMember:req.body.starMember});
   User.register(newUser,req.body.password,function(err,user){
       console.log(user);
       if(err){
           
           return res.render("register",{error:err.message});
       }
      passport.authenticate("local")(req,res,function(){
          req.flash("success","Welcome to grocery shop "+user.username);
          res.redirect("/products");
      });
   });
});

//login logic
app.post("/login",passport.authenticate("local",{
    successRedirect:"/products",
    failureRedirect:"/products"
}),function(req,res){});

//logout route
app.get("/logout",function(req,res){
    req.flash("success","Successfully Logged Out!Thank You!");
    req.logout();
    res.redirect("/products");
});

app.listen(process.env.PORT,process.env.IP,function(){
   console.log("grocery shop has been started"); 
});