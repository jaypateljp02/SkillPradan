import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // The stored password should contain a salt (has a period delimiter)
  if (!stored.includes('.')) {
    console.error("Invalid stored password format - no salt found");
    return false;
  }
  
  const [hashed, salt] = stored.split(".");
  if (!salt) {
    console.error("Invalid stored password format - salt missing");
    return false;
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "skill_swap_session_secret",
    resave: false,
    saveUninitialized: true, // Set to true to ensure cookie is set on first request
    store: storage.sessionStore,
    name: "skillpradaan.sid", // Custom cookie name
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: "none" // Allow cross-site cookie in development
    }
  };
  
  console.log("Session cookie settings:", sessionSettings.cookie);
  
  console.log("Session store initialized:", storage.sessionStore ? "Successfully" : "Failed");

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    console.log("Deserializing user with ID:", id);
    const user = await storage.getUser(id);
    if (!user) {
      console.log("User not found during deserialization");
      return done(null, false);
    }
    console.log("User deserialized successfully:", user.username);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const { username, password, name, email, university, avatar } = req.body;
    
    if (!username || !password || !name || !email) {
      return res.status(400).send("Missing required fields");
    }
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        message: "This username is already taken. Please choose a different username."
      });
    }

    const user = await storage.createUser({
      username,
      password: await hashPassword(password),
      name,
      email,
      university,
      avatar
    });

    // Create welcome activity
    await storage.createActivity({
      userId: user.id,
      type: "account",
      description: "Created account",
      pointsEarned: 50
    });

    // Add a sample challenge for new users
    const challenges = await storage.getAllChallenges();
    if (challenges.length > 0) {
      await storage.createUserChallenge({
        userId: user.id,
        challengeId: challenges[0].id
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      const { password, ...userData } = user;
      res.status(201).json(userData);
    });
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for:", req.body.username);
    
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed for:", req.body.username);
        return res.status(401).send("Invalid username or password");
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return next(loginErr);
        }
        
        console.log("User authenticated successfully:", user.username);
        const { password, ...userData } = user as SelectUser;
        return res.status(200).json(userData);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("Session ID:", req.sessionID);
    console.log("Is authenticated:", req.isAuthenticated());
    console.log("User in session:", req.user ? req.user.username : "None");
    
    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.status(401).send("Not authenticated");
    }
    
    const { password, ...userData } = req.user as SelectUser;
    console.log("Returning user data for:", userData.username);
    res.json(userData);
  });
  
  // Debug endpoint to check session data
  app.get("/api/debug/session", (req, res) => {
    console.log("Debug session endpoint called");
    console.log("Session ID:", req.sessionID);
    console.log("Session:", req.session);
    console.log("Is authenticated:", req.isAuthenticated());
    
    if (req.user) {
      const { password, ...userData } = req.user as SelectUser;
      return res.json({
        sessionId: req.sessionID,
        authenticated: req.isAuthenticated(),
        user: userData
      });
    } else {
      return res.json({
        sessionId: req.sessionID,
        authenticated: req.isAuthenticated(),
        user: null
      });
    }
  });
}
