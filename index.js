const express=require("express");
const cors=require("cors");
require("dotenv").config();
const PORT=process.env.PORT || 8080
const app=express();
const dbConnect=require("./config/dbConnect")
const userRoutes=require("./routes/userRoutes");
const postRoutes=require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
app.use(express.json({extended:true}));
app.use(express.urlencoded({extended:true}));
app.use(cors({credentials:true,origin:"https://localhost:3000"}));
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use(notFound);
app.use(errorHandler);


app.listen(PORT,async()=>{
    await dbConnect();
    console.log(`Server Running on post ${PORT}`);
})

app.get("/hello",(req,res)=>{
    res.json("hello")
})