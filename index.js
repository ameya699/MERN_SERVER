const express=require("express");
const cors=require("cors");
require("dotenv").config();
const PORT=process.env.PORT || 8080
const app=express();
const dbConnect=require("./config/dbConnect")
const userRoutes=require("./routes/userRoutes");
const postRoutes=require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const upload=require("express-fileupload");
app.use(upload());
app.use(express.json({extended:true}));
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use(notFound);
app.use(errorHandler);
app.use('/uploads',express.static(__dirname+'/uploads'));


app.listen(PORT,async()=>{
    await dbConnect();
    console.log(`Server Running on post ${PORT}`);
})

app.get("/hello",(req,res)=>{
    res.json("hello")
})
