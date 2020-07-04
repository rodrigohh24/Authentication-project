//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
const md5 = require("md5")

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {userNewUrlParser: true});



const userSchema = new mongoose.Schema ( { //We added the right part from equal signial for requirements of mongoose encrypt
  email: String,
  password: String
});

// const secret = "Thisisourlittlesecret."; //if someone have access to this const, will be able to decrypt your bynary code

                                    //access to env doc

const User = new mongoose.model("User", userSchema);





app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});


app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username, //This come from "register.ejs" with name=username
    password: md5(req.body.password) //this come from "register.ejs" with name=password
  }); //md5 to convert to in ireversible hash
  newUser.save(function(err){
    if (err){
      console.log(err);
    }else {
      res.render("secrets");
    }
  });
});


app.post("/login", function (req, res){
  const username = req.body.username;
  const password = md5(req.body.password);

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else {
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        }
      }
    }
  });
});
/* The last part allow us to verify that If there is and exixting user
in the mongoo DB you have to directly render to the Secrets page and also
validating the password of the user to give the access to the same*/


app.listen(3000, function (){
  console.log("Server started on port 3000");
});
