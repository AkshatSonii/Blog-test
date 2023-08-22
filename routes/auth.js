const router = require("express").Router();
const mongoose = require("mongoose");
const md5 = require("md5");
const jwt = require("jsonwebtoken");


const UserSchema = new mongoose.Schema({
    username : {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
  }
  );

  mongoose.model("User" , UserSchema); 

//REGISTER

router.get("/register",function(req,res){
    res.sendFile(__dirname + "/register.html");
});


router.post("/register" , async (req,res)=>{
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: md5(req.body.password)
    });

    try{
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    }
    catch(err){
        // res.status(500).json(err);
        console.log(err);
    }

    res.redirect("./auth/login");
});


//LOGIN


router.get("/login",function(req,res){
    res.sendFile(__dirname + "/login.html");
});

router.post("/login", async(req,res) =>{
    try{
        const user = await User.findOne({username: req.body.username});
        !user && res.status(401).json("Wrong credentials");
        const hashedPassword = md5(req.body.password);
        
        hashedPassword !== user.password && res.status(401).json("Wrong credentials");

        const accessToken = jwt.sign({
            id: user._id,
        }, 
        process.env.JWT_SEC,
        {expiresIn: "3d"}
        );

        const {password, ...others} = user._doc;
        
        res.status(200).json({... others, accessToken});
    } 
    catch(err){
        console.log(err);
    }

    res.redirect("/");
})

module.exports = router 