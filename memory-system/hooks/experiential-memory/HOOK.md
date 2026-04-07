---
name: experiential-memory
description: "Auto-score incoming messages by arousal/importance and flag high-scoring ones for memory"
metadata:
  {
    "openclaw":
      {
        "emoji": "🧠",
        "events": ["message:received"],
      },
  }
---

# Experiential Memory Hook

Processes every incoming message and:
1. Logs to `raw/<channel>/chats/<id>/YYYY/MM/DD.jsonl` (canonical truth)
2. Scores for arousal/importance automatically
3. Flags high-scoring messages for memory consolidation

## Scoring

- **Score ≥ 5** → Consider saving to memory
- **Score ≥ 7** → Strongly recommend saving
- Raw logs preserved as canonical truth (survives compaction)

## Customization

Adjust the scoring thresholds and arousal detection in `handler.js` to match your agent's domain. A work-focused agent might score task completions higher; a personal agent might score emotional moments higher.
