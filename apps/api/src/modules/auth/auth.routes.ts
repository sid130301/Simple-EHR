import { Router } from "express";
import {
  EmailPasswordSchema,
  GoogleAuthSchema,
  SignupSchema
} from "@ehr/shared";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { googleLogin, login, me, signup } from "./auth.service.js";

export const authRouter = Router();

authRouter.post("/signup", validate(SignupSchema), asyncHandler(signup));
authRouter.post("/login", validate(EmailPasswordSchema), asyncHandler(login));
authRouter.post("/google", validate(GoogleAuthSchema), asyncHandler(googleLogin));
authRouter.get("/me", authenticate, asyncHandler(me));
