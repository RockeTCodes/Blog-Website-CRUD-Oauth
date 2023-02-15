//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");


//later code 1
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const findOrCreate = require("mongoose-findorcreate");








//default content for pages
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";





//initialising express
const app = express();




//initialising ejs for template
app.set('view engine', 'ejs');




//setting usie parameters for express css and body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//later code 2
app.use(session({
  secret:"thisisasecret",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());






//connecting to mongoDB
mongoose.connect("mongodb+srv://admin-rocketcodes:mzmschool@cluster1.v0l1hp9.mongodb.net/blogDB");




//creating the schema for post

const postSchema = mongoose.Schema({
  title:String,
  content:String
});





//later code 3
const userSchema = new mongoose.Schema({
  email:String,
  googleId:String,
  username:String,
  posts:[postSchema]
});



//later code 4
userSchema.plugin(findOrCreate);



// creating the model
const Post = mongoose.model("Post",postSchema);




//later code 5
const User = mongoose.model("User",userSchema);






//later code 6


passport.serializeUser(function(user,done){
  done(null,user.id);
});
passport.deserializeUser(function(id,done){
  User.findById(id,function(err,user){
    done(err,user);
  });
});




//later 7 oauth2
//google Oauth
passport.use(new GoogleStrategy({
    clientID:    "199248773457-3vdt119b9tvj7oo2ap4ho1u5hghvp424.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "https://lonely-frog-dungarees.cyclic.app/auth/google/logout",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // console.log(profile);
    User.findOrCreate({ googleId: profile.id , email:profile.email,username: profile.displayName }, function (err, user) {
      return done(err, user);
    });
  }
));






//later code 9
app.get("/auth/google",
  passport.authenticate("google", { scope:
      [ "email", "profile" ] }
));

//code later 10
app.get( "/auth/google/logout",
    passport.authenticate( "google", {
        successRedirect: "/logout",
        failureRedirect: "/login"
}));





//Homepage
app.get("/",function(req,res){

let text = "LOGIN";
let path = "login";
if(req.isAuthenticated()){
  text="LOGOUT";
  path="logmeout"
}

Post.find({},function(err,posts){
  if(!err){
    res.render("home",{homeStartingContent:homeStartingContent,posts:posts,text:text,path:path});
  }
});

});


//contact page
app.get("/contact",function(req,res){
  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }
  res.render("contact",{contactContent:contactContent,text:text,path:path});
});





//about page
app.get("/about",function(req,res){
  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }

  res.render("about",{aboutContent:aboutContent,text:text,path:path});
});





//compose page
app.get("/compose",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }

  if(req.isAuthenticated()){
      res.render("compose",{text:text,path:path});
    }
    else{
      res.render("unauthorized",{text:text,path:path});
    }
});



//add new post to website
app.post("/compose",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }


if(req.isAuthenticated()){

  const post = new Post ({
    title : req.body.postTitle,
    content : req.body.postBody
  });

  post.save();

  User.findOne({email:req.user.email},function(err,foundUser){
    if(!err){
      foundUser.posts.push(post);
      foundUser.save();
    }
  });

  res.redirect("/");

}

else{
  res.render("unauthorized",{text:text,path:path});
}


});





//get post by id
app.get("/posts/:postID",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }


  let chk = (req.params.postID);



  Post.findOne({_id:chk},function(err,post){
    if(!err){
      res.render("post",{postTitle:post.title,postBody:post.content,text:text,path:path});

    }


  });


});





//delete page
app.get("/delete",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }



  if(req.isAuthenticated()){


  User.findOne({email:req.user.email},function(err,foundUser){
    if(!err){

      res.render("delete",{posts:foundUser.posts,text:text,path:path});
    }
  });
}
else{
  res.render("unauthorized",{text:text,path:path});
}

});








//update pages
app.get("/update",function(req,res){


  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }

  if(req.isAuthenticated()){
    User.findOne({email:req.user.email},function(err,foundUser){
      if(!err){

        res.render("update",{posts:foundUser.posts,text:text,path:path});
      }
    });
    }



    else{
      res.render("unauthorized",{text:text,path:path});
    }


});











//delete from database

app.post("/delete",function(req,res){

const toDelete = req.body.delete;

if(req.isAuthenticated()){

  Post.findByIdAndRemove({_id:toDelete},function(err){
    if(!err){
      User.findOneAndUpdate({email:req.user.email},{$pull:{posts:{_id:toDelete}}},function(err,foundUser){
        if(!err){
          res.redirect("/delete");
        }
      });
    }
  });

}

});








//update page for blog
app.post("/update",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }


const toUpdate = req.body.update;


  if(req.isAuthenticated()){


    Post.findOne({_id:toUpdate},function(err,post){
      if(!err){
        res.render("updating",{postTitle:post.title,postContent:post.content,postId:toUpdate,text:text,path:path});


      }


    });

  }

  else{
    res.render("unauthorized",{text:text,path:path});
  }




});










//update the respective blog
app.post("/updating",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }


  const updatedPostBody = req.body.postBody;
  const postId = req.body.update;

if(req.isAuthenticated()){

  Post.findOneAndUpdate({_id:postId},{ $set: {"content":updatedPostBody}},function(err){
    if(!err){

       User.findOneAndUpdate({email:req.user.email,"posts._id":postId},{$set:{"posts.$.content":updatedPostBody}},function(err){

         res.redirect("/update");
          });


    }

});

}


else{
  res.render("unauthorized",{text:text,path:path});
}

});








//later code 8
app.get("/login",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }

  if(req.isAuthenticated()){
      res.render("logout");
    }
    else{
      res.render("login",{text:text,path:path});
    }
});






//later code 9
app.get("/logout",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }


  if(req.isAuthenticated()){
      res.render("logout",{text:text,path:path});
    }
    else{
      res.render("login",{text:text,path:path});
    }
});







//later code 10
app.get("/logmeout",function(req,res){
  
  req.logout(function(err){
    if(err){
      console.log(err);
    }
  });
  res.redirect("/");
});







//error routes
app.get("/:topic",function(req,res){

  let text = "LOGIN";
  let path = "login";
  if(req.isAuthenticated()){
    text="LOGOUT";
    path="logmeout"
  }


  const err2 = (req.params.topic);

  if(err2 != "compose" || err2 != "contact"||err2 != "about"){
    res.render("error",{text:text,path:path});
  }
});

app.listen(process.env.PORT||3000,function(){
  console.log("Server started......");
});
