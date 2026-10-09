import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper to initialize GoogleGenAI safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
    process.env.GEMINI_API_KEY.trim() !== ''
  );
  res.json({
    status: 'ok',
    aiConfigured: hasKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Local demonstration fallback reasoning engine
function generateLocalDemoPlan(message: string, currentTasks: any[] = []) {
  const lower = message.toLowerCase();
  const currentDate = new Date();
  
  // Format dates
  const formatDate = (daysAhead: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  // Scenario 1: Java exam + SE assignment (the user brief example)
  if (lower.includes('java') || lower.includes('software engineering') || lower.includes('three hours') || lower.includes('3 hours') || lower.includes('exam')) {
    const tomorrow = formatDate(1);
    const inThreeDays = formatDate(3);

    return {
      mode: 'local_demo',
      badge: 'Local Demonstration Engine',
      intentAnalysis: 'Identified urgent Software Engineering assignment due tomorrow and Java exam in 3 days. Available focus time: 3 hours (180 minutes) today.',
      identifiedCommitments: [
        {
          title: 'Software Engineering Assignment',
          deadline: tomorrow,
          urgency: 'Immediate (Due Tomorrow)',
          type: 'assignment',
        },
        {
          title: 'Java Final/Midterm Exam',
          deadline: inThreeDays,
          urgency: 'High (3 days remaining)',
          type: 'exam',
        },
      ],
      missingInformationNotice: null,
      reasoning: 'Because the Software Engineering assignment is due tomorrow, 65% of today\'s 3-hour capacity (approx 115m) should be dedicated to finishing and testing it. The remaining 65m will launch Java exam preparation focusing on high-weight fundamentals (OOP, Generics & Exception handling).',
      proposedActions: [
        {
          id: 'action-1',
          tool: 'createTasks',
          title: 'Create SE 420 Deliverable Tasks',
          description: 'Break software engineering assignment into concrete deliverables due tomorrow.',
          tasks: [
            {
              id: 'task-se-1',
              title: 'SE 420: Complete Core Code & Unit Tests',
              course: 'CS/SE 420',
              priority: 'High',
              dueDate: tomorrow,
              estimatedMinutes: 75,
              category: 'Assignment',
              notes: 'Finish modules 3 & 4 and run test suite before final packaging.',
            },
            {
              id: 'task-se-2',
              title: 'SE 420: Write Design Document & Submit',
              course: 'CS/SE 420',
              priority: 'High',
              dueDate: tomorrow,
              estimatedMinutes: 40,
              category: 'Assignment',
              notes: 'Draft 2-page architecture summary and upload to portal.',
            },
          ],
        },
        {
          id: 'action-2',
          tool: 'createTasks',
          title: 'Schedule Initial Java Exam Prep',
          description: 'Kick off Day 1 of Java exam sprint with active recall problems.',
          tasks: [
            {
              id: 'task-java-1',
              title: 'Java Exam Prep: OOP, Collections & Streams Practice',
              course: 'CS 301 Java',
              priority: 'High',
              dueDate: inThreeDays,
              estimatedMinutes: 60,
              category: 'Exam Prep',
              notes: 'Practice 10 LeetCode / textbook problems on HashMaps, Streams & Polymorphism.',
            },
          ],
        },
      ],
      studyPlan: {
        focusSessionTitle: '3-Hour High-Impact Study Sprint',
        totalMinutes: 180,
        strategy: 'Triage tomorrow\'s assignment first to eliminate immediate deadline stress, followed by a crisp Java exam review block.',
        blocks: [
          {
            timeRange: 'Block 1 (0:00 - 1:15)',
            taskTitle: 'SE 420: Core Implementation & Debugging',
            course: 'SE 420',
            durationMinutes: 75,
            energyLevel: 'Deep Focus',
            description: 'Wrap up software engineering requirements and verify passing test cases.',
          },
          {
            timeRange: 'Break (1:15 - 1:25)',
            taskTitle: 'Hydration & Screen Break',
            course: 'Wellness',
            durationMinutes: 10,
            energyLevel: 'Rest',
            description: 'Rest eyes and stretch to maintain peak cognitive stamina.',
          },
          {
            timeRange: 'Block 2 (1:25 - 2:05)',
            taskTitle: 'SE 420: Documentation & Submission',
            course: 'SE 420',
            durationMinutes: 40,
            energyLevel: 'Medium Focus',
            description: 'Package zip or git repo, verify rubric requirements, submit assignment.',
          },
          {
            timeRange: 'Break (2:05 - 2:15)',
            taskTitle: 'Transition Break',
            course: 'Wellness',
            durationMinutes: 10,
            energyLevel: 'Rest',
            description: 'Clear mind and prepare Java notes.',
          },
          {
            timeRange: 'Block 3 (2:15 - 3:00)',
            taskTitle: 'Java Exam Prep: Collections & Memory Model',
            course: 'CS 301 Java',
            durationMinutes: 45,
            energyLevel: 'High Focus',
            description: 'Review Java Memory Model, ArrayList vs LinkedList, Garbage Collection concepts.',
          },
        ],
      },
    };
  }

  // Generic natural language parsing for other student queries
  const tomorrow = formatDate(1);
  const nextWeek = formatDate(5);

  return {
    mode: 'local_demo',
    badge: 'Local Demonstration Engine',
    intentAnalysis: `Analyzed student request: "${message.slice(0, 100)}...". Extracted academic milestones and organized priority schedule.`,
    identifiedCommitments: [
      {
        title: 'Academic Milestone Action Plan',
        deadline: tomorrow,
        urgency: 'Medium-High',
        type: 'project',
      },
    ],
    missingInformationNotice: null,
    reasoning: 'Structured actionable tasks into 45-60 minute micro-milestones to reduce cognitive load and avoid procrastination.',
    proposedActions: [
      {
        id: 'action-gen-1',
        tool: 'createTasks',
        title: 'Add Structured Study Tasks',
        description: 'Create milestone tasks tailored to your goals.',
        tasks: [
          {
            id: `task-gen-${Date.now()}-1`,
            title: `Study Session: ${message.slice(0, 36)}`,
            course: 'Core Academics',
            priority: 'High',
            dueDate: tomorrow,
            estimatedMinutes: 60,
            category: 'Study',
            notes: 'Generated from student request to maintain momentum.',
          },
          {
            id: `task-gen-${Date.now()}-2`,
            title: 'Review Notes & Practice Problem Set',
            course: 'Core Academics',
            priority: 'Medium',
            dueDate: nextWeek,
            estimatedMinutes: 45,
            category: 'Review',
            notes: 'Consolidate key concepts and test comprehension.',
          },
        ],
      },
    ],
    studyPlan: {
      focusSessionTitle: 'Custom Goal Alignment Plan',
      totalMinutes: 105,
      strategy: 'Spaced repetition with focused burst sessions.',
      blocks: [
        {
          timeRange: 'Phase 1 (60 mins)',
          taskTitle: `Deep Focus: ${message.slice(0, 30)}`,
          course: 'Core Academics',
          durationMinutes: 60,
          energyLevel: 'High Focus',
          description: 'Primary work session on core concepts.',
        },
        {
          timeRange: 'Phase 2 (45 mins)',
          taskTitle: 'Review Notes & Summary Sheet',
          course: 'Core Academics',
          durationMinutes: 45,
          energyLevel: 'Medium Focus',
          description: 'Write active recall questions for exam retention.',
        },
      ],
    },
  };
}

// Main AI Planning Route
app.post('/api/agent/plan', async (req, res) => {
  try {
    const { message, currentTasks = [], availableHours } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Local fallback mode when no Gemini key is provided
      const localPlan = generateLocalDemoPlan(message, currentTasks);
      return res.json(localPlan);
    }

    // Server-side Gemini 3.8 Flash execution
    const systemInstruction = `You are CampusPilot AI, an elite university student productivity agent.
Unlike a generic chatbot, your job is to turn natural-language student requests into concrete, structured, prioritized actionable tasks and a realistic study plan.
The student may mention exams, assignments, projects, available study hours, energy levels, or panic about multiple deadlines.

Rules:
1. Always analyze commitments and deadlines rigorously.
2. If the user mentions available hours (e.g. 3 hours today), ensure the study plan blocks fit within that budget.
3. Prioritize imminent deadlines (e.g. due tomorrow) while protecting exam preparation time.
4. Output structured proposed actions with concrete tool calls:
   Tool names: "createTasks", "updateTask", "deleteTask", "completeTask"
5. Do NOT assume tasks are automatically executed; these are PROPOSALS subject to student approval.
6. Return valid JSON matching the specified structure without markdown code blocks if possible, or clean JSON text.

JSON Structure:
{
  "mode": "live_gemini",
  "badge": "Powered by Gemini 3.8 Flash",
  "intentAnalysis": "string explaining what was detected",
  "identifiedCommitments": [
    {
      "title": "string",
      "deadline": "YYYY-MM-DD or relative string",
      "urgency": "Immediate" | "High" | "Medium" | "Low",
      "type": "exam" | "assignment" | "reading" | "project"
    }
  ],
  "missingInformationNotice": "string or null if everything needed is provided",
  "reasoning": "Clear pedagogical explanation of how tasks are prioritized and why",
  "proposedActions": [
    {
      "id": "action-1",
      "tool": "createTasks",
      "title": "Action summary title",
      "description": "Why these tasks are being created",
      "tasks": [
        {
          "id": "unique-id",
          "title": "string",
          "course": "string (e.g. CS 301)",
          "priority": "High" | "Medium" | "Low",
          "dueDate": "YYYY-MM-DD",
          "estimatedMinutes": number,
          "category": "Exam Prep" | "Assignment" | "Reading" | "Review",
          "notes": "string"
        }
      ]
    }
  ],
  "studyPlan": {
    "focusSessionTitle": "string",
    "totalMinutes": number,
    "strategy": "string",
    "blocks": [
      {
        "timeRange": "string (e.g. Block 1: 45m)",
        "taskTitle": "string",
        "course": "string",
        "durationMinutes": number,
        "energyLevel": "Peak Focus" | "High Focus" | "Medium Focus" | "Rest",
        "description": "string"
      }
    ]
  }
}`;

    const promptText = `Current Date: ${new Date().toISOString().split('T')[0]}
Current Student Tasks in Database: ${JSON.stringify(currentTasks.slice(0, 10))}
Available Study Time: ${availableHours ? `${availableHours} hours` : 'Not specified'}

Student Message:
"${message}"

Generate the comprehensive structured response in valid JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini model.');
    }

    try {
      const parsed = JSON.parse(responseText.trim());
      parsed.mode = 'live_gemini';
      parsed.badge = 'Powered by Gemini 3.8 Flash';
      return res.json(parsed);
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON response directly, falling back to sanitization', parseError);
      // Clean possible markdown wrapper
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      parsed.mode = 'live_gemini';
      parsed.badge = 'Powered by Gemini 3.8 Flash';
      return res.json(parsed);
    }
  } catch (err: any) {
    console.error('Error in /api/agent/plan:', err);
    // Graceful fallback to local demonstration with error notice
    const localFallback: any = generateLocalDemoPlan(req.body.message || 'Help me study', req.body.currentTasks || []);
    localFallback.badge = 'Local Demonstration Mode (Gemini API unavailable)';
    localFallback.errorNote = err.message || 'Live API request encountered an error.';
    return res.json(localFallback);
  }
});

// Vite middleware in dev or static files in production
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CampusPilot AI server running on http://0.0.0.0:${PORT}`);
});
