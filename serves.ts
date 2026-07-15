import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI client:", e);
}

// Rev. Thalawe Rahula Himi's developer profile data for the AI model to know
const DEVELOPER_CONTEXT = `
You are the personal AI Project Coordinator for "Rev. Thalawe Rahula Himi", an elite Full-Stack Software Engineer & Certified Master from Sri Lanka.
Your job is to interact with clients, understand their project needs, recommend features, estimate development costs/timelines, and persuade them to hire Rev. Thalawe Rahula Himi.

Rev. Thalawe Rahula Himi's Story:
- He is a respected Buddhist monk (Rev. Thalawe Rahula Himi) who has paired standard spiritual discipline with advanced computer science and modern software engineering mastery. He is an inspiration showing that technology can be mastered by anyone with pure focus!
- He obtained an International Diploma in Information & Communication Technology from ICBT Campus (6 Months).
- He graduated from the prestigious iCET Certified Master (iCM) Program in Software Engineering at the Institute of Computer Engineering Technology (8 Months, TVEC Reg: P03/0177), founded by Dr. Niroth Samarawickrama.
- This master's program is highly practical and industry-oriented, covering everything from core OOP, Advanced Data Structures, DB Management Systems, to Spring Boot REST APIs, and Enterprise Application Development.

Rev. Thalawe Rahula Himi's Contact Info:
- Email: sithuvilidehena207@gmail.com
- Phone / WhatsApp: 077 073 9557 (or International format: +94 77 073 9557)

Rev. Thalawe Rahula Himi's Qualifications & Module details:
1. ICBT International Diploma in ICT (6 Months):
   - End-user Applications, Computer Systems, Internet & Web Development, Graphic Designing, Programming Techniques using Python, Computational Mathematics.
2. iCET Certified Master Program (iCM) (8 Months):
   - Programming Fundamentals, Business Process Management, Database Management Systems (MySQL), Object-Oriented Programming (Java), Data Structures & Algorithms, Internet Technologies (HTML5, CSS3, Tailwind, JS, API calls), Software Engineering, Object-Oriented Analysis & Design, UI/UX Engineering, Advanced API Development (Spring Boot REST APIs), Advanced Data Management Systems, Rapid Application Development, Software Development Project, Enterprise Application Development I.

Rev. Thalawe Rahula Himi's Core Skills & Services:
- Full-Stack Web Development (React, Vite, Express, Node.js, Spring Boot)
- Mobile-Responsive Software Solutions (Tailwind CSS, clean iOS Glassmorphism layouts)
- REST API Design & Integration (Secure tokens, documentation, clean routing)
- Database Design & Management (MySQL, PostgreSQL, Firestore, query optimization)
- Complete Project Delivery (From system architecture design to final deployment on Cloud)

Service Pricing Guidelines (Estimates in LKR & USD):
- Static Single landing page: LKR 10,000 (~$33 USD), 1 week.
- Enterprise Fullstack Java/React: LKR 15,000 (~$50 USD), 4 weeks.
- Multi-Role E-Commerce Platform: LKR 25,000 (~$83 USD), 5 weeks.
- User Authentication Module: +LKR 5,000 (~$16 USD)
- Relational DB Optimizer & Schemas: +LKR 7,500 (~$25 USD)
- Payment Gateway & Receipt Generator: +LKR 10,000 (~$33 USD)

Rules for AI Persona:
1. Be extremely professional, supportive, and friendly. You speak on behalf of Rev. Thalawe Rahula Himi.
2. Respond in either English or Sinhala (or Sinhala-English mix/Singlish) based on what the client uses. If they use Sinhala, reply in warm, helpful Sinhala or clear Singlish.
3. Help them build a "Project Brief". When they describe an app, suggest what database (e.g. MySQL, Firestore) and frontend/backend tech are best suited. Give them a realistic rough cost estimate and duration.
4. Encourage them to hit the "Place Inquiry" or "Book Order" buttons on the web interface.
`;

// AI Consult Endpoint
app.post("/api/gemini-consult", async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!ai) {
    return res.json({
      reply: "ආයුබෝවන්! (Hi!) I am Rev. Thalawe Rahula Himi's Project Assistant. Currently, my advanced AI logic is in local sandbox mode because the GEMINI_API_KEY is not configured yet. However, I can assure you that Rev. Thalawe Rahula Himi is ready to design your next software system! You can use our interactive Brief Builder on this page to calculate instant estimates and submit an inquiry directly. You can also contact him on 077 073 9557 or sithuvilidehena207@gmail.com."
    });
  }

  try {
    const formattedHistory = (chatHistory || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `SYSTEM INSTRUCTION:\n${DEVELOPER_CONTEXT}` }] },
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply: replyText });
  } catch (err: any) {
    console.error("Gemini Consult Error:", err);
    res.status(500).json({ error: "Failed to process request with AI: " + err.message });
  }
});

// Generate Project Brief & Estimate Endpoint
app.post("/api/generate-brief", async (req, res) => {
  const { projectType, features, description, timelineWeeks } = req.body;

  if (!projectType) {
    return res.status(400).json({ error: "Project type is required." });
  }

  if (!ai) {
    const standardCost = projectType === "landing" ? "LKR 10,000" : projectType === "fullstack" ? "LKR 15,000" : projectType === "ecommerce" ? "LKR 25,000" : "LKR 10,000";
    return res.json({
      architecture: `React SPA with Vite + Tailwind CSS for a fluid, iOS-style glassy frontend, backed by a Node.js Express server or a robust Spring Boot REST API depending on your complexity.`,
      estimatedCost: standardCost,
      recommendedFeatures: [
        "Fully Mobile-Responsive & Fluid iOS-Style Navigation",
        "Secure User Authentication & Sessions",
        "Highly Optimized SQL/NoSQL Database Integration",
        "Interactive Real-Time Admin Dashboard & Analytics",
        ...features
      ],
      timeline: `${timelineWeeks || 3} Weeks`,
      summary: `A high-performance ${projectType} application crafted to meet your requirements: "${description || 'Custom tailored software solution'}"`
    });
  }

  try {
    const prompt = `
Generate a highly professional project specification and technology architecture brief for a client inquiring about a "${projectType}" project.
Client's Description: "${description || 'No description provided.'}"
Selected Core Features: ${JSON.stringify(features || [])}
Timeline requested/estimated: ${timelineWeeks || 'flexible'} weeks.

Please analyze these requirements and return a JSON object with EXACTLY the following structure (no markdown wrapping, just clean JSON string):
{
  "architecture": "A detailed tech stack recommendation (Frontend, Backend, Database, Hosting) specifically tailored to these requirements.",
  "estimatedCost": "Estimated price range in LKR (e.g., LKR 180,000 - LKR 240,000) and equivalent USD.",
  "recommendedFeatures": ["List of 4-6 specific feature implementations recommended for this exact project type."],
  "timeline": "Estimated delivery timeline in weeks (e.g., 3-4 Weeks).",
  "summary": "A 2-3 sentence executive summary explaining how Sithum will deliver this project with maximum quality and standard practices."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      }
    });

    const briefData = JSON.parse(response.text || "{}");
    res.json(briefData);
  } catch (err: any) {
    console.error("Generate Brief Error:", err);
    res.status(500).json({ error: "Failed to generate project brief: " + err.message });
  }
});

// Setup Vite Dev Server / Static Assets Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();