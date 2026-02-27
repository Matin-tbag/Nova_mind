import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app=express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat",async(req,res)=>{
  const {model,messages}=req.body;

  const response=await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({model,messages})
    }
  );

  const data=await response.json();
  res.json(data);
});

app.listen(3000,()=>console.log("Server running on 3000"));
