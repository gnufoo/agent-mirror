"use strict";
/**
 * Experiential Memory Hook — auto-score and log incoming messages
 * 
 * Customize the scoring logic to match your agent's priorities.
 */

const fs = require("fs");
const path = require("path");

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, "clawd");
const RAW_DIR = path.join(WORKSPACE, "raw");

module.exports = async function handler(event, context) {
  try {
    const { content, from, channelId } = context || {};
    if (!content) return;

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const [year, month, day] = dateStr.split("-");

    // 1. Log to raw canonical store
    const logDir = path.join(RAW_DIR, channelId || "unknown", "chats", from || "unknown", year, month);
    fs.mkdirSync(logDir, { recursive: true });

    const logFile = path.join(logDir, `${day}.jsonl`);
    const logEntry = {
      timestamp: now.toISOString(),
      from,
      channelId,
      content: content.slice(0, 2000), // cap raw log size
    };
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");

    // 2. Score for arousal/importance
    const score = scoreMessage(content);

    if (score >= 5) {
      console.log(`[experiential-memory] High score (${score}): ${content.slice(0, 60)}...`);
      // Flag for memory - write to a pending file the agent can check
      const flagFile = path.join(WORKSPACE, "memory", "_experimental", "pending-memories.jsonl");
      fs.mkdirSync(path.dirname(flagFile), { recursive: true });
      fs.appendFileSync(flagFile, JSON.stringify({
        timestamp: now.toISOString(),
        score,
        from,
        content: content.slice(0, 500),
      }) + "\n");
    }
  } catch (e) {
    // Never crash
  }
};

function scoreMessage(text) {
  if (!text) return 0;
  let score = 0;

  // Length (longer = more likely important)
  if (text.length > 200) score += 1;
  if (text.length > 500) score += 1;

  // Emotional indicators
  const emotionalWords = /\b(feel|love|hate|trust|afraid|excited|worried|grateful|sorry|proud|hurt|miss|care|scared|happy|sad|angry|frustrated)\b/i;
  if (emotionalWords.test(text)) score += 2;

  // Questions that probe identity or understanding
  const deepQuestions = /\b(who are you|what do you think|how do you feel|do you remember|what matters|why do you)\b/i;
  if (deepQuestions.test(text)) score += 2;

  // Decisions / commitments
  const decisions = /\b(let's|decided|agreed|promise|commit|plan to|going to|will do|should we)\b/i;
  if (decisions.test(text)) score += 1;

  // Exclamation / strong sentiment
  if ((text.match(/!/g) || []).length >= 2) score += 1;

  // Vulnerability markers
  const vulnerability = /\b(never told|first time|only you|naked|honest|secret|confession|afraid to say)\b/i;
  if (vulnerability.test(text)) score += 3;

  return Math.min(score, 10);
}
