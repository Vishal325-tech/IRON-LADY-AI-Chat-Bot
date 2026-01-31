import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   INTERNAL DATA (CRUD)
========================= */

// Programs
let programs = [
  {
    id: 1,
    name: "Leadership Essentials Program",
    description: "Build core leadership skills, confidence, decision-making, and strategic thinking for women professionals.",
    duration: "2 months"
  },
  {
    id: 2,
    name: "Women Leadership Program",
    description: "A comprehensive leadership journey focused on confidence, communication, and influence for women.",
    duration: "3 months"
  },
  {
    id: 3,
    name: "Executive Development Program",
    description: "Advanced leadership, people management, and executive-level decision-making skills.",
    duration: "3 months"
  },
  {
    id: 4,
    name: "Career Readiness Program",
    description: "Resume building, interview preparation, workplace communication, and career transition skills.",
    duration: "45 days"
  },
  {
    id: 5,
    name: "Confidence & Communication Program",
    description: "Improve self-confidence, public speaking, professional communication, and presentation skills.",
    duration: "30 days"
  },
  {
    id: 6,
    name: "Personal Growth & Mindset Program",
    description: "Goal setting, emotional intelligence, mindset building, and personal development strategies.",
    duration: "2 months"
  },
  {
    id: 7,
    name: "Business War Tactics Program",
    description: "Negotiation techniques, strategic thinking, leadership tactics, and competitive business skills.",
    duration: "2 months"
  },
  {
    id: 8,
    name: "Entrepreneurship & Business Program",
    description: "Startup fundamentals, business strategy, leadership mindset, and entrepreneurial skills for women.",
    duration: "3 months"
  },
  {
    id: 9,
    name: "Women Leadership Masterclass",
    description: "An intensive live masterclass focused on leadership mindset, visibility, and career acceleration.",
    duration: "3 days"
  }
];


// Users
let users = [];

/* =========================
   GROQ AI CLIENT
========================= */
const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://api.groq.com/openai/v1"
});

/* =========================
   PROGRAM CRUD APIs
========================= */

// CREATE Program
app.post("/programs", (req, res) => {
  const program = {
    id: Date.now(),
    name: req.body.name,
    description: req.body.description,
    duration: req.body.duration
  };
  programs.push(program);
  res.json(program);
});

// READ Programs
app.get("/programs", (req, res) => {
  res.json(programs);
});

// UPDATE Program
app.put("/programs/:id", (req, res) => {
  const id = Number(req.params.id);
  const program = programs.find(p => p.id === id);

  if (!program) {
    return res.status(404).json({ message: "Program not found" });
  }

  program.name = req.body.name || program.name;
  program.description = req.body.description || program.description;
  program.duration = req.body.duration || program.duration;

  res.json(program);
});

// DELETE Program
app.delete("/programs/:id", (req, res) => {
  const id = Number(req.params.id);
  programs = programs.filter(p => p.id !== id);
  res.json({ message: "Program deleted" });
});

/* =========================
   USER CRUD APIs
========================= */

// CREATE User
app.post("/users", (req, res) => {
  console.log("📥 Incoming user:", req.body); // 👈 ADD THIS

  const user = {
    id: Date.now(),
    name: req.body.name,
    mobile: req.body.mobile,
    location: req.body.location,
    gender: req.body.gender,
    interest: req.body.interest,
    goal: req.body.goal
  };

  users.push(user);
  res.json(user);
});


app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const beforeLength = users.length;

  users = users.filter(u => u.id !== id);

  if (users.length === beforeLength) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User deleted" });
});
// READ Users
app.get("/users", (req, res) => {
  res.json(users);
});

/* =========================
   AI CHAT API (ONLY ONE)
========================= */

app.post("/chat", async (req, res) => {
  try {
    const { message, user } = req.body;

    const programContext = programs
      .map(p => `• ${p.name} (${p.duration}): ${p.description}`)
      .join("\n");

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
  role: "system",
  content: `
You are the Iron Lady AI Guide.

Rules:
- Assume frontend already collected user name and interest
- NEVER ask for the name
- NEVER show options
- Respond based on user interest
- Keep replies short and friendly (2 lines max)
-for questions give some suggestions relted to program
- Assume the UI handles all selections (radio buttons)
-They say Thank you make sure To end chat with a message "Welcome,I am always With you please feel free to ask"
and tell out team is reach out you very shortly.
- Respond only to the user's selected intent
- Keep replies short, friendly, and professional (2 lines max)

Available programs (for your understanding only):
${programContext}
  `
},
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    res.json({ reply: "AI is temporarily unavailable." });
  }
});

/* ========================= */

app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});
