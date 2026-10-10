import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeThreat } from './src/server/threatEngine';
import { inspectAgentPayload } from './src/server/agentSecurityEngine';
import { answerCopilotQuery } from './src/server/copilotEngine';
import { inspectUrlSafely } from './src/server/urlInspector';
import { isGeminiConfigured, GEMINI_MODEL } from './src/server/geminiClient';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'VIGILANT AI Threat Intelligence Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// AI Provider Status Endpoint
app.get('/api/ai-status', (_req, res) => {
  const configured = isGeminiConfigured();
  res.json({
    provider: 'Google Gemini',
    model: GEMINI_MODEL,
    apiKeyConfigured: configured,
    activeMode: configured
  ? 'Gemini Configured — Availability Checked Per Request'
  : 'Deterministic Fallback Mode',
    status: configured ? 'READY' : 'STANDBY_FALLBACK',
    capabilities: [
      'Multi-Threat Message Analysis',
      'AI Agent Prompt Injection Inspection',
      'Contextual Security Copilot',
      'Attack Path Reconstruction',
      'Zero-Trust Syntactic URL Analysis'
    ]
  });
});

// Threat Analysis Endpoint
app.post('/api/analyze-threat', async (req, res) => {
  try {
    const { text, sourceType } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text field is required and must not be empty.' });
    }
    if (text.length > 20000) {
      return res.status(400).json({ error: 'Text exceeds maximum payload limit of 20,000 characters.' });
    }

    const report = await analyzeThreat(text, sourceType || 'General Message');
    res.json(report);
  } catch (error: any) {
    console.error('Threat analysis endpoint error:', error);
    res.status(500).json({
      error: error.message || 'An internal error occurred during threat investigation.'
    });
  }
});

// Agent Security & Prompt-Injection Inspector Endpoint
app.post('/api/inspect-agent-payload', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text field is required and must not be empty.' });
    }
    if (text.length > 20000) {
      return res.status(400).json({ error: 'Text exceeds maximum payload limit of 20,000 characters.' });
    }

    const report = await inspectAgentPayload(text);
    res.json(report);
  } catch (error: any) {
    console.error('Agent security endpoint error:', error);
    res.status(500).json({
      error: error.message || 'An internal error occurred during agent payload inspection.'
    });
  }
});

// Security Copilot Q&A Endpoint
app.post('/api/copilot-query', async (req, res) => {
  try {
    const { report, question, conversationHistory } = req.body;
    if (!report || !question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Report and valid question are required.' });
    }

    const answer = await answerCopilotQuery({
      report,
      question,
      conversationHistory
    });

    res.json({ answer });
  } catch (error: any) {
    console.error('Copilot query error:', error);
    res.status(500).json({
      error: error.message || 'An internal error occurred while consulting the Security Copilot.'
    });
  }
});

// Safe URL Inspector Endpoint
app.post('/api/inspect-url', (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL string is required.' });
    }

    const result = inspectUrlSafely(url);
    res.json(result);
  } catch (error: any) {
    console.error('URL inspection error:', error);
    res.status(500).json({
      error: error.message || 'An internal error occurred during URL inspection.'
    });
  }
});

// Mount Vite or Static Files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VIGILANT AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
