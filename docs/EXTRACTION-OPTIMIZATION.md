# Entity Extraction Optimization

## Overview

The entity extraction script now intelligently skips posts that already have entity files, dramatically reducing extraction time and API costs for incremental updates.

## Problem

Previously, every time you ran the extraction script, it would re-extract **all** posts, even if they already had entity files. This was:

- **Slow**: Processing 67 posts takes ~3-5 minutes
- **Costly**: Each run costs $0.15-0.30 in API fees
- **Unnecessary**: Most posts don't change once published

## Solution

The script now checks for existing entity files before extraction:

- **Smart mode (default)**: Skip posts with existing entity files
- **Force mode (--force)**: Re-extract all posts, ignoring existing files

## Usage

### Skip Already Extracted Posts (Default)

```bash
# Process only new posts
node scripts/extract-entities.js

# Process only first 5 new posts
node scripts/extract-entities.js --limit 5

# Process specific file only if not already extracted
node scripts/extract-entities.js --file new-post.md
```

### Force Re-extraction

```bash
# Re-extract all posts
node scripts/extract-entities.js --force

# Re-extract first 5 posts
node scripts/extract-entities.js --limit 5 --force

# Force re-extract specific file
node scripts/extract-entities.js --file existing-post.md --force
```

## How It Works

### Smart Mode (Default)

1. **Check for existing files**: For each post, check if `src/content/entities/posts/{slug}.json` exists
2. **Skip if exists**: If file exists, skip extraction
3. **Process if missing**: If file doesn't exist, extract entities
4. **Report**: Show how many posts were skipped vs. processed

Example output:
```
Found 67 total posts
⏭️  Skipping 65 post(s) with existing entity files
🔄 Processing 2 new/missing post(s)
```

### Force Mode (--force)

1. **Ignore existing files**: Process all posts regardless of existing files
2. **Overwrite**: Replace existing entity files with fresh extraction
3. **Report**: Show normal extraction progress

Example output:
```
Found 67 total posts
⚡ Force: Re-extracting posts even if entity files exist

[1/67] 📝 post-slug-1
...
```

## Benefits

### 1. **Faster Incremental Updates** ⚡

**Before (re-extracting all 67 posts)**:
```bash
node scripts/extract-entities.js
# ⏱️  3-5 minutes
# 💰 $0.15-0.30
```

**After (only new posts)**:
```bash
node scripts/extract-entities.js
# ⏭️  Skipping 67 post(s) with existing entity files
# ✨ All posts already extracted! Use --force to re-extract.
# ⏱️  < 1 second
# 💰 $0.00
```

### 2. **Cost Savings** 💰

- **Initial extraction**: $0.15-0.30 (all 67 posts)
- **Subsequent runs**: $0.00 (skips existing)
- **Adding 1 new post**: $0.002-0.005 (only new post)

### 3. **Developer Experience** ✨

- **Faster feedback**: See results immediately
- **Safe defaults**: Won't accidentally re-extract
- **Explicit override**: Use --force when needed

### 4. **CI/CD Friendly** 🚀

Perfect for automated workflows:
```yaml
# GitHub Actions example
- name: Extract entities from new posts
  run: node scripts/extract-entities.js
  # Only processes new posts automatically
```

## When to Use --force

Use `--force` when you need to re-extract existing posts:

### 1. **Prompt Changes**
If you update the AI prompt to extract new information:
```bash
node scripts/extract-entities.js --force
```

### 2. **AI Model Upgrade**
When switching to a better model:
```bash
export OPENAI_MODEL=gpt-4o
node scripts/extract-entities.js --force
```

### 3. **Bug Fixes**
After fixing extraction logic bugs:
```bash
node scripts/extract-entities.js --force
```

### 4. **Schema Updates**
When adding new entity types (e.g., quotes):
```bash
node scripts/extract-entities.js --force
```

### 5. **Testing Specific Posts**
When debugging extraction for a specific post:
```bash
node scripts/extract-entities.js --file post-slug.md --force
```

## Examples

### Scenario 1: Daily Workflow

You've added 2 new blog posts today:

```bash
# Only extracts the 2 new posts
node scripts/extract-entities.js

# Output:
# Found 69 total posts
# ⏭️  Skipping 67 post(s) with existing entity files
# 🔄 Processing 2 new/missing post(s)
#
# [1/2] 📝 new-post-1
# ...
# [2/2] 📝 new-post-2
# ...
# ⏱️  Time: 5s
# 💰 Cost: $0.004
```

### Scenario 2: Testing Extraction

You want to test extraction on a few posts:

```bash
# Test on 3 posts (skips if already extracted)
node scripts/extract-entities.js --limit 3

# Output:
# ⏭️  Skipping 3 post(s) with existing entity files
# ✨ All posts already extracted! Use --force to re-extract.

# Force re-extraction for testing
node scripts/extract-entities.js --limit 3 --force

# Output:
# [1/3] 📝 post-1
# ...
```

### Scenario 3: Updating Extraction Logic

You've improved the prompt to better extract investors:

```bash
# Re-extract all posts with new logic
node scripts/extract-entities.js --force

# Output:
# Found 67 total posts
# ⚡ Force: Re-extracting posts even if entity files exist
#
# [1/67] 📝 post-1
# ...
# ⏱️  Time: 180s
# 💰 Cost: $0.20
```

### Scenario 4: Fixing One Post

You noticed bad extraction for a specific post:

```bash
# Check current extraction (skips if exists)
node scripts/extract-entities.js --file problematic-post.md

# Output:
# ⏭️  Skipping 1 post(s) with existing entity files

# Force re-extraction
node scripts/extract-entities.js --file problematic-post.md --force

# Output:
# [1/1] 📝 problematic-post
# ...
# ⏱️  Time: 2.5s
# 💰 Cost: $0.003
```

## File Structure

Entity files are stored per-post:

```
src/content/entities/posts/
├── post-slug-1.json
├── post-slug-2.json
├── external-aalo-closes-100m-series-b.json
└── ...
```

The script checks for the existence of these files before extraction.

## Command Line Options

### Complete Options List

```bash
node scripts/extract-entities.js [options]

Options:
  --limit <number>   Process only the first N posts (for testing)
  --file <filename>  Process only a specific post file
  --force            Re-extract all posts, even if entity files exist
  --help, -h         Show help message
```

### Option Combinations

| Command | Behavior |
|---------|----------|
| `(no options)` | Process all new posts (skip existing) |
| `--limit 5` | Process first 5 new posts (skip existing) |
| `--file post.md` | Process specific post if not extracted |
| `--force` | Re-extract all posts |
| `--limit 5 --force` | Re-extract first 5 posts |
| `--file post.md --force` | Force re-extract specific post |

## Output Messages

### Smart Mode Messages

```
✨ Smart mode: Skipping posts with existing entity files (use --force to override)
```
Indicates smart mode is active (default).

```
⏭️  Skipping 65 post(s) with existing entity files
🔄 Processing 2 new/missing post(s)
```
Shows how many posts were skipped vs. processed.

```
✨ All posts already extracted! Use --force to re-extract.
```
All posts in selection already have entity files.

### Force Mode Messages

```
⚡ Force: Re-extracting posts even if entity files exist
```
Indicates force mode is active.

## Implementation Details

### Skip Logic

```javascript
if (!force) {
  const postsToProcess = [];
  const skippedPosts = [];
  
  for (const postFile of postFiles) {
    const slug = postFile.replace(/\.(md|mdx)$/, '');
    const entityFilePath = path.join(POSTS_OUTPUT_DIR, `${slug}.json`);
    
    try {
      await fs.access(entityFilePath);
      // File exists, skip it
      skippedPosts.push(postFile);
    } catch {
      // File doesn't exist, process it
      postsToProcess.push(postFile);
    }
  }
  
  postFiles = postsToProcess;
}
```

### Order of Operations

1. **Load portfolio companies** (always needed for context)
2. **Get list of markdown files** from `src/content/posts/`
3. **Apply --limit or --file filters** (if specified)
4. **Check for existing entity files** (unless --force)
5. **Process remaining posts** with AI extraction
6. **Save individual JSON files** progressively
7. **Report results**

## Performance Comparison

### Initial Run (No Entity Files)

```bash
node scripts/extract-entities.js
```

**Result**: 67 posts processed
- ⏱️  Time: 180-300s (3-5 minutes)
- 💰 Cost: $0.15-0.30
- 📊 Output: 67 JSON files created

### Subsequent Run (All Files Exist)

```bash
node scripts/extract-entities.js
```

**Result**: 0 posts processed
- ⏱️  Time: <1s
- 💰 Cost: $0.00
- 📊 Output: No changes

### Adding One New Post

```bash
node scripts/extract-entities.js
```

**Result**: 1 post processed
- ⏱️  Time: 2-3s
- 💰 Cost: $0.002-0.005
- 📊 Output: 1 new JSON file

### Force Re-extraction

```bash
node scripts/extract-entities.js --force
```

**Result**: 67 posts processed
- ⏱️  Time: 180-300s (3-5 minutes)
- 💰 Cost: $0.15-0.30
- 📊 Output: 67 JSON files overwritten

## Best Practices

### 1. **Use Smart Mode by Default** ✅
```bash
# Good: Only processes new posts
node scripts/extract-entities.js
```

### 2. **Test with --limit First** ✅
```bash
# Good: Test on a few posts first
node scripts/extract-entities.js --limit 3 --force
```

### 3. **Use --force Sparingly** ⚠️
```bash
# Only when you need to re-extract
node scripts/extract-entities.js --force
```

### 4. **Specific File for Debugging** ✅
```bash
# Good: Target specific posts
node scripts/extract-entities.js --file problematic-post.md --force
```

## Troubleshooting

### "All posts already extracted" but I added a new post

**Problem**: New post file exists but entity file doesn't.

**Solution**: The script should process it. Check:
1. Is the file a `.md` or `.mdx` file?
2. Is it in `src/content/posts/`?
3. Check the slug matches: `{slug}.md` → `{slug}.json`

### Need to delete and re-extract one post

**Problem**: Bad extraction for one post.

**Solution**: Delete entity file, then run:
```bash
# Delete entity file
rm src/content/entities/posts/post-slug.json

# Re-extract (will see it's missing)
node scripts/extract-entities.js --file post-slug.md
```

Or use --force:
```bash
node scripts/extract-entities.js --file post-slug.md --force
```

### Want to re-extract everything

**Problem**: Major changes to extraction logic.

**Solution**: Use --force:
```bash
node scripts/extract-entities.js --force
```

Or delete all entity files:
```bash
rm -rf src/content/entities/posts/*.json
node scripts/extract-entities.js
```

## Summary

The extraction optimization provides:

✅ **Fast incremental updates** - Skip existing posts by default  
✅ **Cost savings** - Only pay for new extractions  
✅ **Smart defaults** - Safe, efficient behavior  
✅ **Explicit control** - Use --force when needed  
✅ **Flexible options** - Combine with --limit and --file  
✅ **Clear feedback** - See what's skipped vs. processed  

### Quick Reference

```bash
# Daily use (only new posts)
node scripts/extract-entities.js

# After prompt changes (re-extract all)
node scripts/extract-entities.js --force

# Test on few posts
node scripts/extract-entities.js --limit 3 --force

# Fix one post
node scripts/extract-entities.js --file post.md --force
```

---

**Date**: February 4, 2026  
**Status**: ✅ Implemented and tested
