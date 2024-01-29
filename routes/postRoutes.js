const {Router} =require("express");

const router=Router();

router.get('/',(req,res,next)=>{
 res.json("This is a post get route") 
})

module.exports=router