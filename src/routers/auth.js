import { Router } from "express";
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {validateBody} from "../middlewares/validateBody.js";
import { registerUserSchema, loginUserSchema, requestResetEmailSchema,resetPasswordSchema  } from "../validation/auth.js";
import { registerUserController, loginUserController, logoutUserController, refreshUserSessionController, requestResetTokenController,resetPasswordController } from "../controllers/auth.js";

const router = Router();

router.post('/register', validateBody(registerUserSchema), ctrlWrapper(registerUserController));

router.post('/login', validateBody(loginUserSchema), ctrlWrapper(loginUserController));

router.post('/logout', ctrlWrapper(logoutUserController));

router.post('/refresh', ctrlWrapper(refreshUserSessionController));

router.post('/request-reset-email', validateBody(requestResetEmailSchema), ctrlWrapper(requestResetTokenController));

router.post('/reset-password',validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));

export default router;