const Post=require("../models/postModel");
const User=require("../models/userModel");
const path=require("path");
const fs=require("fs");
const {v4:uuid}=require("uuid");
const HttpError=require("../models/errorModel");
const { log } = require("console");

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
    try{
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return next(new HttpError("Post not found",404));
        }
        res.status(200).json(post);
    }
    catch(err){
        return next(new HttpError(err));
    }
}

const getCatPost=async(req,res,next)=>{
    try{
        const {category}=req.params;
        const catPosts=await Post.find({category}).sort({createdAt:-1});
        res.status(200).json(catPosts);
    }
    catch(err){
        return next(new HttpError(err));
    }
}

const getUserPost=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const posts=await Post.find({creator:id}).sort({createdAt:-1});
        res.status(200).json(posts);
    }
    catch(err){
        return next(new HttpError(err));
    }
}

const editPost=async(req,res,next)=>{
    try{
        let fileName,newFileName,updatedPost;
        const postId=req.params.id;
        //ReactQuill which is used in frontend has a paragraph opening and closing tag with a break tag in between so there are 11 characters in there already. 
        const {title,category,description}=req.body;
        if(!title||!category||description.length<12){
            return next(new HttpError("Fill in all the fields",422));
        }
        if(!req.files){
            updatedPost=await Post.findByIdAndUpdate(postId,{title,category,description},{new:true});
        }
        else{
           
            const oldPost=await Post.findById(postId);
            if(req.user.id==oldPost.creator){
            fs.unlink(path.join(__dirname,"..","uploads",oldPost.thumbnail),async(err)=>{
                if(err){   
                    return next(new HttpError(err));
                }
            })

            const {thumbnail}=req.files;
                if(thumbnail.size>2000000){
                    return next(new HttpError("Thumbnail should be less than 2MB"));
                }
                fileName=thumbnail.name;
                let splittedFilename=fileName.split(".");
                newFileName=splittedFilename[0]+uuid()+"."+splittedFilename[splittedFilename.length-1];
                thumbnail.mv(path.join(__dirname,"..","uploads",newFileName),async(err)=>{
                    if(err){
                            return next(new HttpError(err));
                    }
                   
                    })
                    updatedPost=await Post.findByIdAndUpdate(postId,{title,category,description,thumbnail:newFileName},{new:true});
        }
    }
        if(!updatedPost){
            return next(new HttpError("cannot update the post",422));
        }
        else{
            res.status(200).json(updatedPost);
        }
    }
    catch(err){
        return next(new HttpError(err));
    }
}

const deletePost=async(req,res,next)=>{
    try{
        const postId=req.params.id;
        if(!postId){
            return next("Post unavailable",400);
        }
        const post=await Post.findById(postId);
        const fileName=post.thumbnail;
        if(req.user.id==post.creator){
            fs.unlink(path.join(__dirname,"..","uploads",fileName),async(err)=>{
                if(err){
                    return next(new HttpError(err));
                }else{
                    await Post.findByIdAndDelete(postId);
                    const currentUser=await User.findById(req.user.id);
                    const userPostCount=currentUser.posts-1;
                    await User.findByIdAndUpdate(req.user.id,{posts:userPostCount});
                            res.status(200).json(`Post ${postId} deleted successfully`);

                }
            })
        }
        else{
            return next(new HttpError("Cannot delete post"));
        }
    }
    catch(err){
        return next(new HttpError(err));
    }
}

module.exports={createPost,getPosts,getPost,getCatPost,getUserPost,editPost,deletePost};