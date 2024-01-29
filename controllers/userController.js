const User=require("../models/userModel");
const HttpError=require("../models/errorModel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const fs=require("fs");
const path=require("path");
const {v4:uuid}=require("uuid");
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
    try{
        if(!req.files.avatar){
            return next(new HttpError("Please choose an image",422));
        }
        const user=await User.findById(req.user.id);
        if(user.avatar){
            fs.unlink(path.join(__dirname,'..','uploads',user.avatar),(err)=>{
                if(err){
                    return next(new HttpError(err,422))
                }
            })
        }
        const {avatar}=req.files;
        if(avatar.size>500000){
            return next(new HttpError("Profile picture too big. Should be less than 500kb"),422);
        }
        let fileName;
        fileName=avatar.name;
        let splittedFilename=fileName.split('.');
        let newFilename=splittedFilename[0]+uuid()+'.'+splittedFilename[splittedFilename.length-1];
        avatar.mv(path.join(__dirname,'..','uploads',newFilename),async(err)=>{
            if(err){
                return next(new HttpError(err));
            }
    
            const updatedAvatar=await User.findByIdAndUpdate(req.user.id,{avatar:newFilename},{new:true});
            if(!updatedAvatar){
                return next(new HttpError("Avatar couldn't be changed",422));
            }
            res.status(200).json(updatedAvatar);  
        });
        
    }
    catch(error){
        return next(new HttpError(error,422));
    }
}

const editUser=async(req,res,next)=>{
    res.json("Edit user details");
}

const getAuthors=async(req,res,next)=>{
    try{
        const authors=await User.find().select('-password');
        res.status(200).json(authors);
    }
    catch(error){
        return next(new HttpError(error,422));
    }
}




module.exports={registerUser,loginUser,getUser,changeAvatar,getAuthors,editUser}