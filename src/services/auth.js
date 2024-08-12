import createHttpError from "http-errors";
import { UserCollection } from "../models/user.js";
import { SessionCollection } from "../models/session.js";
import bcrypt from 'bcrypt';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from "../constants/index.js";
import crypto from "crypto";

export const registerUser = async (payload)=>{
  const user = await UserCollection.findOne({email:payload.email});
  if(user) throw createHttpError(409,'Email in use');


  const encrypterPassword = await bcrypt.hash(payload.password,10);
  return await UserCollection.create({...payload,password:encrypterPassword});
};


export const loginUser = async (payload)=>{
  const user = await UserCollection.findOne({email:payload.email});
  if(!user) throw createHttpError(404,"User not found");

  const isEqual = await bcrypt.compare(payload.password,user.password);
  if(!isEqual) throw createHttpError(401,"Unauthorized");

  await SessionCollection.deleteOne({userId:user._id});

  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return await SessionCollection.create({
    userId:user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil:new Date(Date.now()+FIFTEEN_MINUTES),
    refreshTokenValidUntil:new Date(Date.now()+THIRTY_DAYS),
  });
};


export const logoutUser = async (sessionId)=>{
  await SessionCollection.deleteOne({ _id: sessionId });
};

const createSession = ()=>{

  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return{
    accessToken,
    refreshToken,
    accessTokenValidUntil:new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil:new Date(Date.now() + THIRTY_DAYS),
  };
};



export const refreshUserSession = async ({sessionId, refreshToken})=>{
  const session = await SessionCollection.findOne({
    _id:sessionId,
    refreshToken,
  });
  if(!session) throw createHttpError(401,"Session not found");

  const isSessionTokenExpired = new Date()> new Date(session.refreshTokenValidUntil); 
  if(isSessionTokenExpired) throw createHttpError(401,"Session token expired");

  const newSession = createSession();
  await SessionCollection.deleteOne({_id:sessionId, refreshToken});

  return await SessionCollection.create({userId:session.userId,...newSession});
};