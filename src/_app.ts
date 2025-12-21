import express from "express";
import passport from "passport";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import "@/config/_passport.config";
import { globalErrorHandler, notFound } from "@/app/errors";
import { rootResponse } from "@/shared";
import router from "@/app/routes";
import { corsOptions, ENV } from "@/config";

const app = express();

app.use(cors(corsOptions));

app.use(
  expressSession({
    secret: ENV.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.set("json spaces", 2);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
app.all("/", rootResponse);
app.use("/api/v1", router);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
