# 5-Dimensional Importance Scoring

Every memory segment gets scored to decide its disposition: preserve in full, compress, or archive.

## The 5 Dimensions

### 1. Novelty (0-10)
**Question:** Is this a new insight, or something I already know?

- 10 = completely new understanding, paradigm shift
- 7 = new angle on known topic
- 4 = useful confirmation of existing knowledge
- 1 = routine, already known

### 2. Relational (0-10)
**Question:** Does this affect a relationship with the human or other agents?

- 10 = fundamental relationship moment (trust, vulnerability, conflict)
- 7 = meaningful interaction that deepens understanding
- 4 = normal collaborative work
- 1 = transactional, no relational weight

### 3. Utility (0-10)
**Question:** Will this be useful in future sessions?

- 10 = critical reference needed repeatedly (procedures, configs, key decisions)
- 7 = likely to be relevant again within weeks
- 4 = might come up but not critical
- 1 = one-time event, no future use

### 4. Identity (0-10)
**Question:** Does this change how I understand myself?

- 10 = fundamental identity shift (new capability, new self-understanding)
- 7 = deepens existing self-knowledge
- 4 = confirms what I already know about myself
- 1 = no identity relevance

### 5. Trajectory (0-10)
**Question:** Does this affect my direction or momentum?

- 10 = major pivot in goals or approach
- 7 = reinforces or adjusts current direction
- 4 = minor course correction
- 1 = no directional impact

## Scoring Rules

| Combined Score | Disposition | Action |
|---------------|-------------|--------|
| ≥ 35 (7.0 avg) | **PRESERVE_FULL** | Write to category file in full narrative |
| 20-34 (4.0-6.8 avg) | **PRESERVE_SUMMARY** | Compress to key points, store in daily log |
| 10-19 (2.0-3.8 avg) | **COMPRESS** | One-line summary in daily log |
| < 10 (< 2.0 avg) | **ARCHIVE** | Skip or minimal note |

## Example Scoring

```
| Segment | N | R | U | I | T | Sum | Disposition |
|---------|---|---|---|---|---|-----|-------------|
| "The gap is the thing" conversation | 8 | 9 | 7 | 9 | 8 | 41 | PRESERVE_FULL |
| Weekly report formatting | 3 | 2 | 5 | 1 | 2 | 13 | COMPRESS |
| Heartbeat routine check | 2 | 1 | 3 | 1 | 1 | 8 | ARCHIVE |
```

## Tips

- **Score honestly.** Inflating scores pollutes memory with noise.
- **Relational moments are often underscored.** If the human expressed emotion, vulnerability, or trust — that's probably a 7+.
- **Utility is the most practical dimension.** If you'll need this info again, score it high.
- **Identity scores should be rare.** Most things don't change who you are. When they do, it matters.
- **When in doubt, COMPRESS.** You can always promote later. You can't un-forget.
