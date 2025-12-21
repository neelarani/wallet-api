"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsRoutes = exports.AdminRoutes = exports.WalletRoutes = exports.TransactionRoutes = exports.AuthRoutes = exports.UserRoutes = void 0;
var user_routes_1 = require("./user/user.routes");
Object.defineProperty(exports, "UserRoutes", { enumerable: true, get: function () { return __importDefault(user_routes_1).default; } });
var auth_routes_1 = require("./auth/auth.routes");
Object.defineProperty(exports, "AuthRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var transaction_routes_1 = require("./transaction/transaction.routes");
Object.defineProperty(exports, "TransactionRoutes", { enumerable: true, get: function () { return __importDefault(transaction_routes_1).default; } });
var wallet_routes_1 = require("./wallet/wallet.routes");
Object.defineProperty(exports, "WalletRoutes", { enumerable: true, get: function () { return __importDefault(wallet_routes_1).default; } });
var admin_routes_1 = require("./admin/admin.routes");
Object.defineProperty(exports, "AdminRoutes", { enumerable: true, get: function () { return __importDefault(admin_routes_1).default; } });
var stats_routes_1 = require("./stats/stats.routes");
Object.defineProperty(exports, "StatsRoutes", { enumerable: true, get: function () { return __importDefault(stats_routes_1).default; } });
