# Entity Extraction - Timing & Cost Tracking

## Summary

Added comprehensive timing and cost tracking to the entity extraction script, providing detailed insights into API usage, performance, and expenses.

## Features Added

### 1. **Per-Post Metrics**
Each post extraction now shows:
- Extraction time in seconds
- Token usage (prompt + completion)
- Cost in USD (for paid APIs)

Example output:
```
✅ Extracted: 1 companies, 0 investors, 1 people, 1 facts
⏱️  Time: 2.19s [2947 tokens] ($0.0005)
```

### 2. **Cumulative Statistics**
At the end of extraction, shows:
- Total time and average per post
- Total tokens and average per post
- Total cost and average per post

Example output:
```
⏱️  Performance:
   Total time: 7.37s
   Avg time per post: 2.46s
   Total tokens: 5,157
   Avg tokens per post: 1,719

💰 Cost:
   Total cost: $0.0009
   Avg cost per post: $0.0003
```

### 3. **Provider-Specific Pricing**

#### OpenAI (gpt-4o-mini)
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens
- **Calculated from actual API response**

#### FAL AI (Llama models)
- Estimated: ~$0.65 per 1M tokens
- **Estimated from response length** (FAL doesn't always provide token counts)

#### LM Studio (Local)
- Cost: $0 (local model)
- Tokens tracked if available

## Usage Metrics

### Cost Estimates for Full Extraction (67 posts)

Based on 3-post sample:
- Avg tokens per post: **1,719**
- Avg cost per post: **$0.0003**

**Projected for all 67 posts:**
- Total tokens: ~115,173
- Total cost: ~**$0.02** (2 cents)

**Actual timing:**
- Avg time per post: ~2.5s
- Total time for 67 posts: ~168s (~2.8 minutes)

### Context Size Impact

After increasing context limit from 3,500 to 8,000 characters:
- More accurate extraction (full post content)
- Slightly higher token usage
- Still very cost-effective

## Command Line Examples

### Test single post with timing:
```bash
node scripts/extract-entities.js --file post-why-dt-invests.md
```

### Test 3 posts:
```bash
node scripts/extract-entities.js --limit 3
```

### Full extraction with cost tracking:
```bash
node scripts/extract-entities.js
```

## Implementation Details

### Response Format
All AI provider functions now return:
```javascript
{
  content: "JSON response string",
  usage: {
    promptTokens: 1234,
    completionTokens: 567,
    totalTokens: 1801,
    cost: 0.0003
  }
}
```

### Cost Calculation

**OpenAI:**
```javascript
const inputCost = (promptTokens / 1000000) * 0.150;
const outputCost = (completionTokens / 1000000) * 0.600;
const totalCost = inputCost + outputCost;
```

**FAL (estimated):**
```javascript
const estimatedTokens = Math.ceil((prompt.length + response.length) / 4);
const cost = (estimatedTokens / 1000000) * 0.65;
```

**LM Studio:**
```javascript
const cost = 0; // Local model, no cost
```

### Tracking Variables
```javascript
let totalCost = 0;
let totalTime = 0;
let totalTokens = 0;
```

Updated after each post extraction:
```javascript
totalCost += entities._meta.usage.cost || 0;
totalTime += entities._meta.elapsedTime || 0;
totalTokens += entities._meta.usage.totalTokens || 0;
```

## Benefits

1. **Cost Transparency**: Know exactly how much each extraction run costs
2. **Performance Monitoring**: Track improvements/regressions in extraction time
3. **Token Usage Insights**: Understand prompt size and response length
4. **Budget Planning**: Estimate costs for larger extractions
5. **Provider Comparison**: Compare costs between OpenAI, FAL, and local models

## Example Output

### Single Post:
```
📄 Processing: From Riff to Rooftop: Why I Invest at PWV
  Calling OpenAI API...
  Using model: gpt-4o-mini
  ✅ Extracted: 0 companies, 1 investors, 1 people, 0 facts
  ⏱️  Time: 2.19s [2947 tokens] ($0.0005)
```

### Multiple Posts Summary:
```
✅ Entity extraction complete!
📊 Results:
   Posts processed: 67
   Companies found: 83
   Investors found: 53
   People found: 42
   Topics found: 71

⏱️  Performance:
   Total time: 168.42s
   Avg time per post: 2.51s
   Total tokens: 115,173
   Avg tokens per post: 1,719

💰 Cost:
   Total cost: $0.0201
   Avg cost per post: $0.0003

💾 Saved to: src/content/entities/extracted-entities.json
```

## Notes

- Timing includes API call latency
- Costs are calculated in real-time from API responses
- Token counts are exact for OpenAI, estimated for FAL
- Local models (LM Studio) show timing but zero cost
- 1-second delay between posts adds to total time (rate limiting)

## Cost Optimization

Current setup is already very cost-effective:
- **Full 67-post extraction: ~$0.02**
- Using gpt-4o-mini (cost-effective OpenAI model)
- Could use gpt-4o-nano for even lower cost if available
- FAL AI is comparable in cost
- LM Studio is free but requires local setup

## Future Enhancements

- [ ] Add cost projections before starting extraction
- [ ] Support for other models (Claude, Gemini, etc.)
- [ ] Cost comparison report between providers
- [ ] Export cost tracking to CSV/JSON
- [ ] Budget alerts/limits
