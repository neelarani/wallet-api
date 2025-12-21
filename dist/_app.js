"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("./config/_passport.config");
const errors_1 = require("./app/errors");
const shared_1 = require("./shared");
const routes_1 = __importDefault(require("./app/routes"));
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)(config_1.corsOptions));
app.use((0, express_session_1.default)({
    secret: config_1.ENV.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.set("json spaces", 2);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.all("/", shared_1.rootResponse);
app.use("/api/v1", routes_1.default);
app.use(errors_1.notFound);
app.use(errors_1.globalErrorHandler);
exports.default = app;
