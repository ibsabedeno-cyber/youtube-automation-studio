import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app=express(), __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:"2mb"}));
app.use(session({secret:process.env.SESSION_SECRET||"dev-only-change-me",resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production"}}));
app.use(express.static(path.join(__dirname,"public")));
const oauthClient=()=>new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI);
const requireAuth=(req,res,next)=>req.session.tokens?next():res.status(401).json({error:"Connect your YouTube account first."});
app.get("/api/config",(req,res)=>res.json({configured:!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET),connected:!!req.session.tokens}));
app.get("/auth/google",(req,res)=>{
  if(!process.env.GOOGLE_CLIENT_ID||!process.env.GOOGLE_CLIENT_SECRET)return res.status(503).send("Add Google OAuth credentials to .env first.");
  const client=oauthClient();
  res.redirect(client.generateAuthUrl({access_type:"offline",prompt:"consent",scope:["https://www.googleapis.com/auth/youtube.readonly","https://www.googleapis.com/auth/yt-analytics.readonly"]}));
});
app.get("/auth/google/callback",async(req,res)=>{
  try{const {tokens}=await oauthClient().getToken(req.query.code);req.session.tokens=tokens;res.redirect("/?connected=1");}
  catch(e){res.status(500).send("Google connection failed. Please try again.");}
});
app.post("/auth/logout",(req,res)=>{req.session.destroy(()=>res.json({ok:true}));});
app.get("/api/channel",requireAuth,async(req,res)=>{
  try{const auth=oauthClient();auth.setCredentials(req.session.tokens);
    const yt=google.youtube({version:"v3",auth});
    const r=await yt.channels.list({part:["snippet","statistics","contentDetails"],mine:true});
    res.json(r.data.items?.[0]||{});
  }catch(e){res.status(502).json({error:"Could not load channel data. Check OAuth scopes and API access."});}
});
app.get("/api/videos",requireAuth,async(req,res)=>{
  try{const auth=oauthClient();auth.setCredentials(req.session.tokens);
    const yt=google.youtube({version:"v3",auth});
    const ch=await yt.channels.list({part:["contentDetails"],mine:true});
    const uploads=ch.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if(!uploads)return res.json({items:[]});
    const pl=await yt.playlistItems.list({part:["snippet","contentDetails"],playlistId:uploads,maxResults:25});
    res.json({items:pl.data.items||[]});
  }catch(e){res.status(502).json({error:"Could not load videos."});}
});
app.get("/api/comments",requireAuth,async(req,res)=>{
  try{const auth=oauthClient();auth.setCredentials(req.session.tokens);
    const yt=google.youtube({version:"v3",auth});
    const r=await yt.commentThreads.list({part:["snippet"],allThreadsRelatedToChannelId:true,maxResults:30,order:"time"});
    res.json({items:r.data.items||[]});
  }catch(e){res.status(502).json({error:"Comments unavailable. Check channel permissions."});}
});
app.listen(process.env.PORT||3000,()=>console.log(`YouTube Automation Studio running on http://localhost:${process.env.PORT||3000}`));