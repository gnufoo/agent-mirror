#!/bin/bash
# Pick up where the last session left off
# Reads the most recent session summary or state-of-mind snapshot

WORKSPACE="${1:-$HOME/clawd}"

# Check for state-of-mind (written pre-compaction)
SOM="$WORKSPACE/memory/_experimental/state-of-mind.md"
if [ -f "$SOM" ]; then
    echo "=== State of Mind (pre-compaction snapshot) ==="
    cat "$SOM"
    echo ""
fi

# Find yesterday and today's daily logs
TODAY=$(date -u +%Y-%m-%d)
YESTERDAY=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)

for DATE in "$TODAY" "$YESTERDAY"; do
    LOG="$WORKSPACE/memory/$DATE.md"
    if [ -f "$LOG" ]; then
        echo "=== Daily Log: $DATE ==="
        tail -40 "$LOG"
        echo ""
    fi
done
