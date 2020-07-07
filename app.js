//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
// it´s to important the order
app.use(session({  // firs you have to set up the service
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); // Then initializa the passport package
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema ( { //We added the right part from equal signial for requirements of mongoose encrypt
  email: String,
  password: String
});

// const secret = "Thisisourlittlesecret."; //if someone have access to this const, will be able to decrypt your bynary code

userSchema.plugin(passportLocalMongoose); // this plugin is require to set up the configuration of the cookie in the DB

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());  //Those three lines come exactly like the documentation

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){ //We need this route because we have required fromt code above
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login"); // in case that the user is no authenticated correctly we are going to redirect to the same page again
  }
});

app.get("/logout", function(req, res){
  req.logout();  //This come from passport documentation
  res.redirect("/"); //when the user is logout redirect to the home route
});

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");

      //Explanation: this lines of code allof the user to redirect to the page in case that the authentication wawas successful
      });
    }
    });
  });

//   const newUser = new User({
//     email: req.body.username, //This come from "register.ejs" with name=username
//     password: hash //this come from "register.ejs" with name=password
//   }); //md5 to convert to in ireversible hash
//   newUser.save(function(err){
//     if (err){
//       console.log(err);
//     }else {
//       res.render("secrets");
//     }
//   });
// });


app.post("/login", function (req, res){
  const user = new User ({
    username: req.body.username,
    password: req.body.password
    });
    req.login(user, function(err){
      if (err){
        console.log(err);
      } else {
        passport.authenticate("local");
        res.redirect("/secrets");
      }
    })
  });

/* The last part allow us to verify that If there is and exixting user
in the mongoo DB you have to directly render to the Secrets page and also
validating the password of the user to give the access to the same*/


app.listen(3000, function (){
  console.log("Server started on port 3000");
});
