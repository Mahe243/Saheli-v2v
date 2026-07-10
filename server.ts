/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize database file path
const DB_FILE = path.join(process.cwd(), "data", "saheli_db.json");

interface DbSchema {
  users: any[];
  authentications: any[];
  profiles: any[];
  preferences: any[];
  consents: any[];
  securityLogs: any[];
}

function initDb() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      users: [],
      authentications: [],
      profiles: [],
      preferences: [],
      consents: [],
      securityLogs: []
    }, null, 2));
  }
}

function readDb(): DbSchema {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    return {
      users: data.users || [],
      authentications: data.authentications || [],
      profiles: data.profiles || [],
      preferences: data.preferences || [],
      consents: data.consents || [],
      securityLogs: data.securityLogs || []
    };
  } catch (e) {
    console.error("Error reading database file:", e);
    return { users: [], authentications: [], profiles: [], preferences: [], consents: [], securityLogs: [] };
  }
}

function writeDb(data: DbSchema) {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing database file:", e);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function logSecurityAction(userId: string | undefined, action: string, details: string, req: express.Request) {
  const db = readDb();
  const log = {
    id: "log_" + Math.random().toString(36).substring(2, 9),
    userId,
    action,
    details,
    ipAddress: req.ip || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "unknown",
    timestamp: new Date().toISOString()
  };
  db.securityLogs.unshift(log);
  writeDb(db);
  console.log(`[Security Log] ${action}: ${details}`);
}

// Initialize Gemini client (safely, checking if API key is present)
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found in environment. Using smart simulated fallback engine.");
}

// Robust helper to parse JSON response from Gemini, handling markdown block wrappers if present
function safeParseJSON(text: string | undefined): any {
  if (!text) return {};
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("safeParseJSON: standard parsing failed, attempting cleanup of backslashes or internal quotes:", e);
    try {
      return JSON.parse(cleaned.replace(/,\s*([\]}])/g, "$1"));
    } catch (innerError) {
      throw e;
    }
  }
}

// Multi-User Auth Routes
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phone, password, preferredLanguage } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required fields." });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = db.users.find(u => u.email.toLowerCase().trim() === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const userId = "u_" + Math.random().toString(36).substring(2, 9);
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const newUser = {
    id: userId,
    email: normalizedEmail,
    fullName,
    phone,
    preferredLanguage: preferredLanguage || "English",
    role: "Patient", // Default Role
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const newAuth = {
    id: "auth_" + Math.random().toString(36).substring(2, 9),
    userId,
    passwordHash,
    salt,
    mfaEnabled: false
  };

  const newProfile = {
    id: "prof_" + Math.random().toString(36).substring(2, 9),
    userId,
    age: 28, // Seed defaults which are overwritten by first-time onboarding
    height: "155 cm",
    weight: "58 kg",
    bloodGroup: "O+",
    emergencyContactName: "Rajesh Devi",
    emergencyContactPhone: "+91 98765 43210",
    updatedAt: new Date().toISOString()
  };

  const newPref = {
    userId,
    theme: "light",
    notifications: { email: true, sms: false, push: true },
    privacy: { shareWithDoctors: true, shareWithCaregivers: false, useAiOptimization: true, allowAnonymousTelemetry: false },
    reminders: { medications: true, appointments: true, dailyCheckins: true }
  };

  const privacyConsent = {
    id: "con_" + Math.random().toString(36).substring(2, 9),
    userId,
    consentType: "Privacy Policy",
    status: "Accepted",
    version: "1.0",
    timestamp: new Date().toISOString()
  };

  const termsConsent = {
    id: "con_" + Math.random().toString(36).substring(2, 9),
    userId,
    consentType: "Terms & Conditions",
    status: "Accepted",
    version: "1.0",
    timestamp: new Date().toISOString()
  };

  db.users.push(newUser);
  db.authentications.push(newAuth);
  db.profiles.push(newProfile);
  db.preferences.push(newPref);
  db.consents.push(privacyConsent);
  db.consents.push(termsConsent);

  writeDb(db);

  logSecurityAction(userId, "Register", `Successfully registered user account with email: ${normalizedEmail}`, req);
  logSecurityAction(userId, "Consent Accepted", "Accepted Privacy Policy v1.0 and Terms & Conditions v1.0", req);

  // Generate simple session token
  const token = "sess_" + crypto.randomBytes(24).toString("hex");

  return res.json({
    success: true,
    token,
    user: newUser,
    profile: newProfile,
    preferences: newPref
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required fields." });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();

  const user = db.users.find(u => u.email.toLowerCase().trim() === normalizedEmail);
  if (!user) {
    logSecurityAction(undefined, "Login Failed", `Attempted login for non-existent email: ${normalizedEmail}`, req);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const auth = db.authentications.find(a => a.userId === user.id);
  if (!auth) {
    return res.status(500).json({ error: "Internal credentials lookup failed." });
  }

  const inputHash = hashPassword(password, auth.salt);
  if (inputHash !== auth.passwordHash) {
    logSecurityAction(user.id, "Login Failed", "Incorrect password entered", req);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const profile = db.profiles.find(p => p.userId === user.id) || {};
  const preferences = db.preferences.find(p => p.userId === user.id) || {};

  logSecurityAction(user.id, "Login Success", `User ${normalizedEmail} authenticated successfully`, req);

  const token = "sess_" + crypto.randomBytes(24).toString("hex");

  return res.json({
    success: true,
    token,
    user,
    profile,
    preferences
  });
});

app.post("/api/auth/profile/update", (req, res) => {
  const { userId, fullName, phone, preferredLanguage, age, height, weight, bloodGroup, emergencyContactName, emergencyContactPhone } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }

  const db = readDb();
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  // Update User attributes
  db.users[userIndex].fullName = fullName || db.users[userIndex].fullName;
  db.users[userIndex].phone = phone || db.users[userIndex].phone;
  db.users[userIndex].preferredLanguage = preferredLanguage || db.users[userIndex].preferredLanguage;
  db.users[userIndex].updatedAt = new Date().toISOString();

  // Update or Create Profile
  let profIndex = db.profiles.findIndex(p => p.userId === userId);
  if (profIndex === -1) {
    const newProf = {
      id: "prof_" + Math.random().toString(36).substring(2, 9),
      userId,
      age: Number(age) || 28,
      height: height || "155 cm",
      weight: weight || "58 kg",
      bloodGroup: bloodGroup || "O+",
      emergencyContactName: emergencyContactName || "",
      emergencyContactPhone: emergencyContactPhone || "",
      updatedAt: new Date().toISOString()
    };
    db.profiles.push(newProf);
    profIndex = db.profiles.length - 1;
  } else {
    db.profiles[profIndex].age = Number(age) !== undefined ? Number(age) : db.profiles[profIndex].age;
    db.profiles[profIndex].height = height !== undefined ? height : db.profiles[profIndex].height;
    db.profiles[profIndex].weight = weight !== undefined ? weight : db.profiles[profIndex].weight;
    db.profiles[profIndex].bloodGroup = bloodGroup !== undefined ? bloodGroup : db.profiles[profIndex].bloodGroup;
    db.profiles[profIndex].emergencyContactName = emergencyContactName !== undefined ? emergencyContactName : db.profiles[profIndex].emergencyContactName;
    db.profiles[profIndex].emergencyContactPhone = emergencyContactPhone !== undefined ? emergencyContactPhone : db.profiles[profIndex].emergencyContactPhone;
    db.profiles[profIndex].updatedAt = new Date().toISOString();
  }

  writeDb(db);
  logSecurityAction(userId, "Password Changed", "Profile details updated", req);

  return res.json({
    success: true,
    user: db.users[userIndex],
    profile: db.profiles[profIndex]
  });
});

app.post("/api/auth/preferences/update", (req, res) => {
  const { userId, theme, notifications, privacy, reminders } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }

  const db = readDb();
  let prefIndex = db.preferences.findIndex(p => p.userId === userId);

  if (prefIndex === -1) {
    const newPref = {
      userId,
      theme: theme || "light",
      notifications: notifications || { email: true, sms: false, push: true },
      privacy: privacy || { shareWithDoctors: true, shareWithCaregivers: false, useAiOptimization: true, allowAnonymousTelemetry: false },
      reminders: reminders || { medications: true, appointments: true, dailyCheckins: true }
    };
    db.preferences.push(newPref);
    prefIndex = db.preferences.length - 1;
  } else {
    db.preferences[prefIndex].theme = theme || db.preferences[prefIndex].theme;
    db.preferences[prefIndex].notifications = { ...db.preferences[prefIndex].notifications, ...notifications };
    db.preferences[prefIndex].privacy = { ...db.preferences[prefIndex].privacy, ...privacy };
    db.preferences[prefIndex].reminders = { ...db.preferences[prefIndex].reminders, ...reminders };
  }

  writeDb(db);
  logSecurityAction(userId, "Consent Accepted", "Updated user system, notification, and privacy preferences", req);

  return res.json({
    success: true,
    preferences: db.preferences[prefIndex]
  });
});

app.post("/api/auth/consent/update", (req, res) => {
  const { userId, consentType, status } = req.body;
  if (!userId || !consentType || !status) {
    return res.status(400).json({ error: "Missing required consent parameters." });
  }

  const db = readDb();
  const consent = {
    id: "con_" + Math.random().toString(36).substring(2, 9),
    userId,
    consentType,
    status,
    version: "1.0",
    timestamp: new Date().toISOString()
  };

  db.consents.push(consent);
  writeDb(db);

  logSecurityAction(userId, status === "Accepted" ? "Consent Accepted" : "Consent Revoked", `${status} consent for: ${consentType}`, req);

  return res.json({ success: true, consent });
});

app.get("/api/auth/logs/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const userLogs = db.securityLogs.filter(l => l.userId === userId);
  return res.json({ logs: userLogs });
});

app.get("/api/auth/export/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDb();

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const profile = db.profiles.find(p => p.userId === userId) || {};
  const preferences = db.preferences.find(p => p.userId === userId) || {};
  const consents = db.consents.filter(c => c.userId === userId);
  const logs = db.securityLogs.filter(l => l.userId === userId);

  return res.json({
    exportedAt: new Date().toISOString(),
    user,
    profile,
    preferences,
    consents,
    logs
  });
});

app.post("/api/auth/delete", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }

  const db = readDb();
  
  db.users = db.users.filter(u => u.id !== userId);
  db.authentications = db.authentications.filter(a => a.userId !== userId);
  db.profiles = db.profiles.filter(p => p.userId !== userId);
  db.preferences = db.preferences.filter(p => p.userId !== userId);
  db.consents = db.consents.filter(c => c.userId !== userId);
  db.securityLogs = db.securityLogs.filter(l => l.userId !== userId);

  writeDb(db);
  console.log(`[Account Deletion] User ${userId} and all related data purged completely.`);

  return res.json({ success: true, message: "Account and associated health profiles completely deleted." });
});

// Serve saheli image dynamically from the workspace root, assets, or src directory
app.get("/saheli.jpeg", (req, res) => {
  const searchDirs = [
    process.cwd(),
    path.join(process.cwd(), "src"),
    path.join(process.cwd(), "assets"),
    path.join(process.cwd(), "public")
  ];
  
  for (const dir of searchDirs) {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        // Match saheli.jpeg, saheli.jpg, saheli.png with case insensitivity
        const match = files.find(f => {
          const lower = f.toLowerCase();
          return lower === "saheli.jpeg" || lower === "saheli.jpg" || lower === "saheli.png";
        });
        if (match) {
          console.log(`Serving matched logo image: ${match} from ${dir}`);
          return res.sendFile(path.join(dir, match));
        }
      }
    } catch (e) {
      console.error("Error searching for saheli image:", e);
    }
  }
  // If no file uploaded yet, send a 404 so React falls back gracefully to the SVG
  res.status(404).send("Logo file not found in workspace yet.");
});

// REST API for medical interview
// It takes current answers and history, and generates either the NEXT smart question or the final clinical summary.
app.post("/api/gemini/interview", async (req, res) => {
  const { history, userProfile, isComplete } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Invalid history payload." });
  }

  // Define structured questions for the local simulated fallback
  const simulatedQuestions = [
    {
      id: "q1",
      text: "What brings you here today, Priya? Where is the discomfort or what symptom are you experiencing?",
      field: "chiefComplaint",
      placeholder: "e.g., severe back pain, headache, fatigue",
      suggestions: ["Lower back discomfort", "Headache & Dizziness", "Extreme Fatigue", "Joint stiffness"]
    },
    {
      id: "q2",
      text: "When did this discomfort first begin, and how long does it last when it happens?",
      field: "timeline",
      placeholder: "e.g., 3 days ago, comes and goes",
      suggestions: ["Started 3 days ago", "Happens mostly in the evening", "Been ongoing for a week", "Just started today"]
    },
    {
      id: "q3",
      text: "On a scale of 1 to 10 (or mild/moderate/severe), how intense is the discomfort right now?",
      field: "severity",
      placeholder: "e.g., 5 out of 10, moderate pain",
      suggestions: ["Mild (does not stop daily tasks)", "Moderate (makes field work difficult)", "Severe (resting is required)"]
    },
    {
      id: "q4",
      text: "Does anything specific make it feel better, like resting, warm water, or a certain posture?",
      field: "betterFactor",
      placeholder: "e.g., lying down flat, local warm compress",
      suggestions: ["Lying down flat", "Applying hot compress", "Gentle walking", "Nothing seems to help"]
    },
    {
      id: "q5",
      text: "Does anything make it feel worse, like bending over, standing for a long time, or lifting things?",
      field: "worseFactor",
      placeholder: "e.g., walking too far, lifting water pots",
      suggestions: ["Standing for a long time", "Lifting water pots", "Bending over", "Sitting still"]
    },
    {
      id: "q6",
      text: "Have you ever experienced this exact discomfort in the past? If yes, how was it treated?",
      field: "historyOfSymptom",
      placeholder: "e.g., no, first time or yes, during pregnancy",
      suggestions: ["No, this is the first time", "Yes, had this mild backache during pregnancy", "Yes, occasional occurrences"]
    },
    {
      id: "q7",
      text: "Are you taking any local medicines, herbal tea, or painkillers for this currently?",
      field: "currentMedsForSymptom",
      placeholder: "e.g., only iron supplements, no painkillers",
      suggestions: ["No medicine yet", "Taking daily prescribed Iron supplements only", "Took a paracetamol yesterday"]
    },
    {
      id: "q8",
      text: "Is there anything else you want our system or your doctor to remember forever about your health?",
      field: "additionalInfo",
      placeholder: "e.g., busy schedule with fields work and baby care",
      suggestions: ["I work 4 hours in the fields", "I want to prepare for second pregnancy soon", "Nothing else, thank you"]
    }
  ];

  // If the user requested final summary generation
  if (isComplete) {
    if (ai) {
      try {
        const prompt = `
          You are a warm, supportive, senior medical transcription assistant.
          Analyze this conversation history of a clinical health interview with a female patient:
          
          Patient Profile details:
          Name: ${userProfile?.name || "Priya"}
          Age: ${userProfile?.age || "28"}
          Additional profile info: ${JSON.stringify(userProfile || {})}

          Conversation Q&A History:
          ${history.map((h: any) => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n")}

          Please generate a formal clinical "Patient Summary" with the following four JSON fields:
          1. chiefComplaint: A single short sentence stating the primary reason for seeking care.
          2. symptoms: An array of specific symptoms mentioned (e.g., ["lower back ache", "fatigue"]).
          3. timeline: A brief chronological description of when it started and how it progressed.
          4. questionsForDoctor: An array of 3 highly helpful, respectful questions the patient can ask her doctor during her visit.
          5. severity: Must be one of "Mild", "Moderate", or "Severe".

          Return ONLY valid JSON.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                chiefComplaint: {
                  type: Type.STRING,
                  description: "A single short sentence stating the primary reason for seeking care."
                },
                symptoms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "An array of specific symptoms mentioned (e.g., ['lower back ache', 'fatigue'])."
                },
                timeline: {
                  type: Type.STRING,
                  description: "A brief chronological description of when it started and how it progressed."
                },
                questionsForDoctor: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "An array of 3 highly helpful, respectful questions the patient can ask her doctor during her visit."
                },
                severity: {
                  type: Type.STRING,
                  description: "Must be one of 'Mild', 'Moderate', or 'Severe'."
                }
              },
              required: ["chiefComplaint", "symptoms", "timeline", "questionsForDoctor", "severity"]
            }
          }
        });

        const parsedResult = safeParseJSON(response.text);
        return res.json({ summary: parsedResult });
      } catch (error) {
        console.error("Gemini summary generation failed, falling back to heuristic:", error);
      }
    }

    // Heuristic Summary Fallback
    const chiefComplaintAns = history.find(h => h.field === "chiefComplaint")?.answer || "Unspecified discomfort";
    const timelineAns = history.find(h => h.field === "timeline")?.answer || "Recently noticed";
    const severityAns = history.find(h => h.field === "severity")?.answer || "Moderate";
    const betterAns = history.find(h => h.field === "betterFactor")?.answer || "Rest";
    const worseAns = history.find(h => h.field === "worseFactor")?.answer || "Activity";
    const historyAns = history.find(h => h.field === "historyOfSymptom")?.answer || "First occurrence";

    const computedSeverity = severityAns.toLowerCase().includes("severe") ? "Severe" : severityAns.toLowerCase().includes("mild") ? "Mild" : "Moderate";

    const fallbackSummary = {
      chiefComplaint: chiefComplaintAns,
      symptoms: [chiefComplaintAns, "Associated fatigue"],
      timeline: `Began: ${timelineAns}. Relieved by: ${betterAns}. Aggravated by: ${worseAns}. Previous history: ${historyAns}.`,
      questionsForDoctor: [
        `What is the most likely cause of my ${chiefComplaintAns.toLowerCase()}?`,
        `Are there specific gentle exercises or safe local remedies I can use to feel better?`,
        `Are there any warning signs I should watch out for that mean I need to go to the hospital immediately?`
      ],
      severity: computedSeverity
    };

    return res.json({ summary: fallbackSummary });
  }

  // Otherwise, determine the next question to ask
  const answeredFields = history.map((h: any) => h.field);
  const nextQuestionConfig = simulatedQuestions.find(q => !answeredFields.includes(q.field));

  if (!nextQuestionConfig) {
    // All questions answered, trigger summary
    return res.json({ isFinished: true });
  }

  if (ai) {
    try {
      const prompt = `
        You are a highly friendly, warm, and culturally sensitive female health guide supporting women in villages and cities.
        We are doing a step-by-step health assessment.
        The current answered fields are: ${JSON.stringify(answeredFields)}.
        The next specific medical concept to assess is: "${nextQuestionConfig.field}".
        The patient's name is ${userProfile?.name || "Priya"}.
        Here is the conversation history so far:
        ${history.map((h: any) => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n")}

        Please rephrase the following default question into a warm, deeply comforting, and extremely easy-to-understand question in English, simple enough for a woman with low digital literacy:
        "${nextQuestionConfig.text}"

        Return a JSON object containing:
        - "questionText": The warm, comfortingly rephrased question.
        - "suggestions": An array of 3 or 4 simple, highly common single-word or short-phrase response options matching the context (for easy clicking).
        
        Keep it short (max 2 sentences), respectful, and clear.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questionText: {
                type: Type.STRING,
                description: "The warm, comfortingly rephrased question."
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 3 or 4 simple, highly common single-word or short-phrase response options matching the context (for easy clicking)."
              }
            },
            required: ["questionText", "suggestions"]
          }
        }
      });

      const parsed = safeParseJSON(response.text);
      return res.json({
        id: nextQuestionConfig.id,
        text: parsed.questionText || nextQuestionConfig.text,
        field: nextQuestionConfig.field,
        placeholder: nextQuestionConfig.placeholder,
        suggestions: parsed.suggestions || nextQuestionConfig.suggestions
      });
    } catch (err) {
      console.error("Gemini question generation failed, falling back to simulated:", err);
    }
  }

  // Simulated fallback question
  return res.json(nextQuestionConfig);
});

// Configure Vite middleware for development or Static Server for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Asha AI Health OS Server] listening on host 0.0.0.0 and port ${PORT}`);
  });
}

startServer();
