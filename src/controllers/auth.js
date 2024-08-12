import createHttpError from "http-errors";
import { THIRTY_DAYS } from "../constants/index.js";
import { registerUser, loginUser, logoutUser, refreshUserSession  } from "../services/auth.js";


export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    status:201,
    message:"Succesfully registered a user!",
    data:user
  });
};


export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie("refreshToken", session.refreshToken,{
    httpOnly:true,
    expires: new Date(Date.now() + THIRTY_DAYS)
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.json({
    status:200,
    message:"Successfully logged in an user!",
    data:{
      accessToken:session.accessToken
    }
  });
};


export const logoutUserController = async(req,res)=>{
if(req.cookies.sessionId){
  await logoutUser(req.cookies.sessionId);
}
else{
  throw createHttpError(401);
}
res.clearCookie("sessionId");
res.clearCookie("refreshToken");
res.status(204).send();
};



const setupSession = async(res,session)=>{
  res.cookie("refreshToken", session.refreshToken,{
    httpOnly:true,
    expires: new Date(Date.now() + THIRTY_DAYS)
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};


export const refreshUserSessionController = async(req,res)=>{
  const session = await refreshUserSession({
    sessionId:req.cookies.sessionId,
    refreshToken:req.cookies.refreshToken
  });

  setupSession(res,session);
  
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
