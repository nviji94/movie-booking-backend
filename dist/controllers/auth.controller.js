"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.googleLogin = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = require("../prisma");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Register user (default role: user)
const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: { email, password: hashed, role: "user" }, // default role
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, role: user.role });
    }
    catch {
        res.status(400).json({ error: "User already exists" });
    }
};
exports.register = register;
// Login user with email & password
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
        return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ error: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
};
exports.login = login;
// Google OAuth login
const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            return res.status(401).json({ error: "Invalid Google token" });
        const email = payload.email;
        const googleId = payload.sub;
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: { email, googleId, role: "user" },
            });
        }
        else if (!user.googleId) {
            user = await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { googleId },
            });
        }
        const appToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token: appToken, role: user.role });
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ error: "Google authentication failed" });
    }
};
exports.googleLogin = googleLogin;
const getMe = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, role: true },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getMe = getMe;
