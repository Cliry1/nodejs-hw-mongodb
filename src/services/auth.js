import createHttpError from "http-errors";
import { UserCollection } from "../models/user.js";
import { SessionCollection } from "../models/session.js";
import bcrypt from 'bcrypt';
import { FIFTEEN_MINUTES, TEMPLATES_DIR, THIRTY_DAYS } from "../constants/index.js";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';


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




export const requestResetToken = async (email)=>{
const user = await UserCollection.findOne({email});
if(!user){
  throw createHttpError(404,"User not found");
}

const resetToken = jwt.sign({
  sub:user._id,
  email
},
env('JWT_SECRET'),
{
  expiresIn:"5m"
});

const resetPasswordTemplatePath = path.join(TEMPLATES_DIR,'reset-password-email.html');
const templateSourse = (await fs.readFile(resetPasswordTemplatePath)).toString();
const template = handlebars.compile(templateSourse);

const html = template({
  name: user.name,
  link:`${env('APP_DOMAIN')}/reset-password?token=${resetToken}`
});
try{
  await sendEmail({
    from:env(SMTP.SMTP_FROM),
    to:email,
    subject:"Reset your password",
    html
  });
}
catch (err) {
  console.log(err);
  throw createHttpError(500, "Failed to send the email, please try again later.");
}

};




export const resetPassword = async (payload, sessionId)=>{
  let entries;

  try{
    entries=jwt.verify(payload.token,env("JWT_SECRET"));
  }
  catch(error){
    if(error instanceof Error) throw createHttpError(401,"Token is expired or invalid.");
    throw error;
  }

  const user = await UserCollection.findOne({email:entries.email, _id:entries.sub});

  if(!user){
    throw createHttpError(404, 'User not found');
  }

  const encrypterPassword = await bcrypt.hash(payload.password,10);

  await UserCollection.updateOne({_id:user._id},{password:encrypterPassword});

  await SessionCollection.deleteOne({ _id: sessionId });
};
