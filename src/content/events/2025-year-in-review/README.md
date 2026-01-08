# 2025 Year in Review Events

This directory contains the events for the PWV 2025 Year in Review timeline, organized for easier management.

## Directory Structure

```
2025-year-in-review/
├── index.json           # Metadata (title, year, description)
├── events/              # Individual event files
│   ├── 2025-01-20-stay-bei-san-francisco.json
│   ├── 2025-01-22-retrace-pwv.json
│   ├── 2025-01-23-landing-more-customers.json
│   └── ... (42 total event files)
└── README.md           # This file
```

## How It Works

1. **Individual Event Files**: Each event is stored in its own JSON file in the `events/` directory, named by its ID (e.g., `2025-01-23-landing-more-customers.json`).

2. **Metadata File**: The `index.json` file contains the timeline metadata (title, year, description).

3. **Combined File**: Before building, run the combine script to generate `2025-year-in-review.json` in the parent directory, which Astro's content collection loader uses.

## Adding or Editing Events

### To add a new event:

1. Create a new JSON file in the `events/` directory with the event ID as the filename
2. Use this structure:
   ```json
   {
     "id": "2025-12-31-event-name",
     "date": "2025-12-31",
     "title": "Event Title",
     "category": "event",
     "emoji": "🎉",
     "time": "6:00 PM - 9:00 PM",
     "location": "Location Name",
     "description": "Event description"
   }
   ```
3. Run the combine script (see below)

### To edit an event:

1. Find the event file in the `events/` directory
2. Edit the JSON directly
3. Run the combine script (see below)

### To update metadata:

1. Edit `index.json`
2. Run the combine script (see below)

## Combining Files

After making changes, regenerate the combined file:

```bash
node -e "
import fs from 'fs';
import path from 'path';

const eventsDir = './src/content/events/2025-year-in-review';
const indexPath = path.join(eventsDir, 'index.json');
const eventsDirPath = path.join(eventsDir, 'events');

const indexContent = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
const eventFiles = fs.readdirSync(eventsDirPath)
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const eventPath = path.join(eventsDirPath, f);
    return JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  });

const combined = {
  ...indexContent,
  events: eventFiles,
};

const outputPath = './src/content/events/2025-year-in-review.json';
fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2));
console.log(\`Created \${outputPath} with \${eventFiles.length} events\`);
" --input-type=module
```

Or add this as a package.json script for convenience.

## Benefits of This Structure

- **Easier to manage**: Each event is in its own file, making it easy to find and edit
- **Better for version control**: Git diffs show only the changed events, not the entire timeline
- **Organized by content**: Events are grouped together, separate from metadata
- **Scalable**: Easy to add hundreds of events without dealing with a massive JSON file
