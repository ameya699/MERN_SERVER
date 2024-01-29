const {Router} =require("express");
const {registerUser,loginUser,getUser,changeAvatar,getAuthors,editUser} =require("../controllers/userController");
const { route } = require("./userRoutes");
const router=Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/:id',getUser);
router.get('/',getAuthors);
router.post('/change-avatar',changeAvatar);
router.patch('/edit-user',editUser);

module.exports=router