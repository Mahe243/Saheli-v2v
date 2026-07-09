/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
          }
        });

        const parsedResult = JSON.parse(response.text || "{}");
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
        }
      });

      const parsed = JSON.parse(response.text || "{}");
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
