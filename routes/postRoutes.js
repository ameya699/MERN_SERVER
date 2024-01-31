const {Router} =require("express");
const {createPost,getPosts,getPost,getCatPost,getUserPost,editPost,deletePost}=require("../controllers/postControllers");
const authMiddleware=require("../middleware/authMiddleware");
const router=Router();

router.post('/',authMiddleware,createPost);
router.get('/',getPosts);
router.get('/:id',getPost);
router.patch('/:id',authMiddleware,editPost);
router.get('/categories/:category',getCatPost);
router.get('/users/:id',getUserPost);
router.delete('/:id',authMiddleware,deletePost);


module.exports=router