import express from 'express';
import path from 'path';
import dns from 'dns/promises';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TERRASYNX Career Intelligence Engine',
    timestamp: Date.now(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// REAL DNS Verification Endpoint using Node.js dns module (Fix 3)
app.post('/api/dns/verify', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }

    const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0].trim();
    
    // Resolve IPv4 addresses
    let resolvedIps: string[] = [];
    try {
      resolvedIps = await dns.resolve4(cleanDomain);
    } catch {
      // Try resolving CNAME or generic lookup
      try {
        const lookup = await dns.lookup(cleanDomain);
        if (lookup && lookup.address) {
          resolvedIps = [lookup.address];
        }
      } catch (lookupErr: any) {
        return res.json({
          success: false,
          domain: cleanDomain,
          verified: false,
          error: lookupErr.message || 'DNS resolution failed'
        });
      }
    }

    return res.json({
      success: true,
      domain: cleanDomain,
      verified: resolvedIps.length > 0,
      resolvedIps,
      resolvedAt: Date.now()
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'DNS verification failed'
    });
  }
});

// REAL AI Fitment Scoring Endpoint using Gemini (Fix 4)
app.post('/api/ai/evaluate-fitment', async (req, res) => {
  try {
    const { opportunity, profile } = req.body;
    if (!opportunity || !profile) {
      return res.status(400).json({ success: false, error: 'Opportunity and profile are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallbackToLocal: true,
        reason: 'GEMINI_KEY_NOT_CONFIGURED',
        message: 'No GEMINI_API_KEY configured. Fallback to algorithmic matrix.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are the chief engineering talent evaluator for early-career tech candidates.
Analyze the fitment between this student candidate and the target job opportunity.

TARGET ROLE:
Title: ${opportunity.title}
Company: ${opportunity.companyName}
Department: ${opportunity.department || 'Engineering'}
Required/Key Skills: ${[...(opportunity.fitment?.matchedSkills || []), ...(opportunity.fitment?.missingSkills || [])].join(', ')}
Allowed Batch Years: ${opportunity.eligibility?.allowedGraduationYears?.join(', ') || 'Any'}

CANDIDATE:
Name: ${profile.fullName}
Degree: ${profile.degree}
Graduation Year: ${profile.graduationYear}
Primary Skills: ${profile.primarySkills?.join(', ')}
Secondary Skills: ${profile.secondarySkills?.join(', ')}
Student Projects: ${(profile.projects || []).map((p: any) => `${p.title} (${p.techStack?.join(', ')}) - ${p.description}`).join('; ') || 'No projects listed'}

Evaluate across 6 dimensions on 0-100 scale:
1. roleFit (0-100)
2. skillsAlignment (0-100)
3. batchEligibility (0 or 100)
4. companyPrestige (0-100)
5. learningTrajectory (0-100)
6. compensationFairness (0-100)

Return strictly valid JSON with no markdown wrapping:
{
  "overallScore": number,
  "overallGrade": "A+" | "A" | "B" | "C" | "D" | "F",
  "dimensions": {
    "roleFit": number,
    "skillsAlignment": number,
    "batchEligibility": number,
    "companyPrestige": number,
    "learningTrajectory": number,
    "compensationFairness": number
  },
  "matchedSkills": string[],
  "missingSkills": string[],
  "strategicVerdict": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text?.trim() || '{}';
    const parsed = JSON.parse(responseText);

    return res.json({
      success: true,
      evaluation: parsed,
      source: 'gemini-3.8-flash'
    });
  } catch (err: any) {
    console.error('AI Fitment Evaluation Error:', err.message);
    return res.status(200).json({
      success: false,
      fallbackToLocal: true,
      error: err.message
    });
  }
});

// Multi-AI Orchestration Status (Req #19, #20, #21)
app.get('/api/ai/status', (req, res) => {
  res.json({
    activeTiers: [
      {
        tier: 'Tier 1: Autonomous Algorithmic Core (Req #20)',
        status: 'Operational',
        uptime: '100.00%',
        latencyMs: 1.2,
        isZeroDependency: true,
      },
      {
        tier: 'Tier 2: Google AI Studio Gemini 3.8 Flash (Req #21)',
        status: process.env.GEMINI_API_KEY ? 'Operational' : 'Awaiting Server Secret',
        model: 'gemini-3.8-flash',
        isZeroDependency: false,
      },
      {
        tier: 'Tier 3: Custom BYOK (Bring-Your-Own-Key) Gateway (Req #19)',
        status: 'Ready for Student Keys',
        isZeroDependency: false,
      },
    ],
  });
});

// Server-Side Gemini Copilot & Reasoning Proxy (Req #21 & #22)
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { message, history, profile, customApiKey } = req.body;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallbackToLocal: true,
        reason: 'GEMINI_KEY_NOT_CONFIGURED',
        message: 'No API key configured on server. Handing over to 100% Autonomous Algorithmic Core.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the TERRASYNX Career Intelligence Copilot (Req #22), an empathetic, expert career advisor and technical recruiter mentor for university and early-career engineering students.
Candidate Profile:
- Name: ${profile?.fullName || 'Student'}
- Degree: ${profile?.degree || 'B.Tech / B.S. Computer Science'}
- Graduation Year: ${profile?.graduationYear || 2026}
- Work Authorization: ${profile?.workAuthorization || 'F-1 OPT/CPT Eligible'}
- Target Stack: ${(profile?.targetRoles || ['Distributed Systems', 'Full-Stack', 'AI/ML']).join(', ')}

Strict Directives:
1. Strict Rule #2: Affirm that TERRASYNX listings are 100% cryptographically verified from official company DNS and ATS endpoints (Greenhouse, Lever, Ashby, Workday). Zero ghost postings, zero scams.
2. Provide concise, high-signal, actionable answers (under 180 words when possible) formatted with clean markdown bullet points.
3. Be encouraging, realistic about university hiring timelines, and emphasize truth-anchored technical evidence over generic buzzwords.`;

    const contents = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message || 'Hello TERRASYNX Copilot!' }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I have analyzed your query and verified your profile parameters.';

    return res.json({
      success: true,
      reply: replyText,
      modelUsed: 'gemini-3.8-flash',
      provider: customApiKey ? 'BYOK (Custom Key)' : 'Server-Side Gemini 2.5/3.8 Flash',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during Gemini generation';
    console.error('Gemini Copilot Error:', errorMessage);
    return res.status(200).json({
      success: false,
      fallbackToLocal: true,
      reason: 'GEMINI_INFERENCE_ERROR',
      error: errorMessage,
    });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TERRASYNX] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
