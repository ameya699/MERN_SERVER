const User=require("../models/userModel");
const HttpError=require("../models/errorModel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

const registerUser=async(req,res,next)=>{
    try{
        const {name,email,password,password2}=req.body;
        console.log(req.body);
        if(!name ||!email ||!password){
            return next(new HttpError("Fill in all the fields",422));
        }
        const newEmail=email.toLowerCase();
        const emailExists=await User.findOne({email:newEmail});
        if(emailExists){
            return next(new HttpError("Email already exists",422));
        }
        if(password.trim().length<6){
            return next(new HttpError("Password should be atleast 6 character",422));

        }
        if(password!=password2){
            return next(new HttpError("Passwords do not match",422));
        }
        
        const salt =await bcrypt.genSalt(10);
        const hashedPass=await bcrypt.hash(password,salt);
        console.log(req.body);
        const newUser=await User.create({name,email:newEmail,password:hashedPass});
        res.status(201).json(`new user ${newEmail} registered`);
    }
    catch(err){
        return next(new HttpError("User Registration Failed",422));
    }
}

const loginUser=async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        if(!email||!password){
            return next(new HttpError("Fill in all fields",422));
        }

        const newEmail=email.toLowerCase();
        const user=await User.findOne({email:newEmail});
        if(!user){
            return next(new HttpError("Invalid Credentials",422));
        }
        const comparePass=await bcrypt.compare(password,user.password);
        if(!comparePass){
            return next(new HttpError("Invalid Credentials",422));
        }
        const {_id:id,name}=user;
        const token=jwt.sign({id,name},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.status(200).json({token,id,name});
    }
    catch(error){
        return next(new HttpError("Login Failed. Please check your credentials",422))
    }
}

const getUser=async(req,res,next)=>{
   try{
    const {id}=req.params;
    const user=await User.findById(id).select('-password');
    if(!user){
        return next(new HttpError("User not Found",422));
    }
    res.status(200).json(user);
   }
   catch(error){
    return next(new HttpError(error,422));
   }
}

const changeAvatar=async(req,res,next)=>{
    res.json("change avatar");
}

const editUser=async(req,res,next)=>{
    res.json("Edit user details");
}

const getAuthors=async(req,res,next)=>{
    try{
    
    }
    catch(error){
        return next(new HttpError(error,422));
    }
}




module.exports={registerUser,loginUser,getUser,changeAvatar,getAuthors,editUser}