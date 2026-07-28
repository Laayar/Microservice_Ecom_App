import { Router } from "express";
import { register, login, signout } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/signout", signout);

export default authRouter;
