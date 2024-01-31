const Post=require("../models/postModel");
const User=require("../models/userModel");
const path=require("path");
const fs=require("fs");
const {v4:uuid}=require("uuid");
const HttpError=require("../models/errorModel");

const createPost=async(req,res,next)=>{
    try{
        let {title,category,description}=req.body;
        if(!title|| !category ||!description || !req.files){
            return next(new HttpError("Fill in all the fields and choose thumbnail",422));
        }
        const {thumbnail}=req.files;
        if(thumbnail.size>2000000){
            return next(new HttpError("Thumbnail size should be less than 2MB"));
        }

        let fileName=thumbnail.name;
        let splittedFilename=fileName.split('.');
        let newFilename=splittedFilename[0]+uuid()+'.'+splittedFilename[1];
        thumbnail.mv(path.join(__dirname,'..','/uploads',newFilename),async(err)=>{
            if(err){
                console.log("err1");
                return next(new HttpError(err));
            }
            else{
                const newPost=await Post.create({title,category,description,thumbnail:newFilename,creator:req.user.id});
                if(!newPost){
                    console.log("err2");
                    return next(new HttpError("Posts couldn't be created",422));
                }
                const currentUser=await User.findById(req.user.id);
                const userpostcount=currentUser.posts+1;
                await User.findByIdAndUpdate(req.user.id,{posts:userpostcount});
                res.status(201).json(newPost);
            }
        })
    }
    catch(err){
        console.log("err3");
        return next(new HttpError(err));
    }
}


const getPosts=async(req,res,next)=>{
    try{
        const posts=await Post.find().sort({updatedAt:-1});
        res.status(200).json(posts);
    }
    catch(err){
        return next(new HttpError(err));
    }
}

const getPost=async(req,res,next)=>{
    res.json("get single posts");
}

const getCatPost=async(req,res,next)=>{
    res.json("get category posts");
}

const getUserPost=async(req,res,next)=>{
    res.json("get user posts");
}

const editPost=async(req,res,next)=>{
    res.json("edit post");
}

const deletePost=async(req,res,next)=>{
    res.json("delete post");
}

module.exports={createPost,getPosts,getPost,getCatPost,getUserPost,editPost,deletePost};