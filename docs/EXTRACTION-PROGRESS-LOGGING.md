# Extraction Progress Logging

## Overview

Added progress counters to the entity extraction script to show processing progress as posts are extracted.

## Changes Made

### Progress Counter Format

Each post now displays its position in the extraction queue:

```
[1/3] 📝 external-20-years-of-git-still-weird-still-wonderful
📄 Processing: 20 years of Git. Still weird, still wonderful.
  Calling OpenAI API...
  Using model: gpt-4o-mini
  ✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
  ⏱️  Time: 1.46s [2149 tokens] ($0.0004)

[2/3] 📝 external-a-letter-from-ralf-and-jan
📄 Processing: A letter from Ralf and Jan
  ...

[3/3] 📝 external-aalo-closes-100m-series-b
📄 Processing: Aalo Closes $100M Series B
  ...
```

### Benefits

1. **Progress Tracking**: Easy to see how far through the extraction you are
2. **Time Estimation**: Can estimate remaining time based on current post
3. **Visual Feedback**: Clear indication that processing is ongoing
4. **Single File Support**: Works with `--file` option too (`[1/1]`)

### Implementation

Modified the main processing loop in `scripts/extract-entities.js`:

```javascript
// Before:
for (const file of postFiles) {
  console.log(`  📝 Slug: ${slug}`);
  console.log(`\n📄 Processing: ${title}`);
}

// After:
for (let i = 0; i < postFiles.length; i++) {
  const file = postFiles[i];
  console.log(`\n[${i + 1}/${postFiles.length}] 📝 ${slug}`);
  console.log(`📄 Processing: ${title}`);
}
```

## Usage Examples

### Limited Extraction:
```bash
node scripts/extract-entities.js --limit 5
```

Output:
```
[1/5] 📝 external-20-years-of-git-still-weird-still-wonderful
[2/5] 📝 external-a-letter-from-ralf-and-jan
[3/5] 📝 external-aalo-closes-100m-series-b
[4/5] 📝 external-announcing-inngest-queues
[5/5] 📝 external-apple-vision-pro-is-here
```

### Single File:
```bash
node scripts/extract-entities.js --file post-why-dt-invests.md
```

Output:
```
[1/1] 📝 post-why-dt-invests
```

### Full Extraction:
```bash
node scripts/extract-entities.js
```

Output:
```
[1/67] 📝 external-20-years-of-git-still-weird-still-wonderful
[2/67] 📝 external-a-letter-from-ralf-and-jan
...
[67/67] 📝 post-why-dt-invests
```

## User Experience

The progress counter makes long extraction runs much more informative:

- **Know where you are**: `[23/67]` tells you you're about 1/3 done
- **Spot issues**: If it stops at `[45/67]`, you know which post had a problem
- **Time estimates**: See avg time per post and calculate remaining time
- **Confidence**: Visual feedback that the process is working

## Related Features

Works seamlessly with:
- `--limit N` flag
- `--file filename.md` flag
- Timing and cost tracking
- Full extraction runs

All improvements tested and working! ✅
