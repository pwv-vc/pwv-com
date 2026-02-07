# PWV Discovery Terminal

A retro computer terminal interface for exploring PWV blog posts, portfolio companies, people, and insights.

## 🎮 Features

### Retro Terminal Aesthetic
- Green phosphor CRT-style display
- Scanline effects and subtle screen glow
- ASCII art PWV logo
- Boot sequence animation
- Blinking cursor
- Command history (↑/↓ arrows)

### Discovery Commands

All `/news/` paths in the terminal output are clickable links that open the full post in a new tab.

#### Basic Commands
- `help` - Show all available commands
- `stats` - Display corpus statistics (total posts, companies, people, topics)
- `clear` - Clear the terminal screen
- `surprise me` - Random discovery (company, person, fact, or connection)

#### Discovery Commands
- `discover random` - Random fact, figure, or entity
- `discover company <name>` - Full company profile with mentions and related posts
- `discover person <name>` - Person profile with role and related posts
- `discover topic <topic>` - Topic explorer with related posts

#### Exploration Commands
- `timeline <company>` - Chronological view of company mentions
- `connections <entity1> <entity2>` - Find common posts between two entities

#### Easter Eggs
- `whoami` - Random PWV philosophy quote
- `cowsay <text>` - ASCII art cow says your message
- `history` - View command history

## 🚀 Usage

### Access the Terminal
Visit `/explore` on the PWV website to access the discovery terminal.

### Example Commands

```bash
# Get statistics about the blog corpus
stats

# Discover a specific company
discover company Cursor

# Find a person
discover person Tom Preston-Werner

# Explore a topic
discover topic AI

# See timeline of mentions
timeline Liquid AI

# Find connections between entities
connections Cursor AI

# Get a random insight
discover random

# Be surprised
surprise me

# Get philosophical
whoami
```

## 🔧 Implementation

### Architecture

```
src/
├── pages/
│   └── explore.astro              # Main terminal page
├── components/
│   └── Terminal/
│       ├── TerminalInterface.tsx  # React terminal component
│       ├── QueryEngine.ts         # Command parser & query logic
│       └── types.ts               # TypeScript types
├── lib/
│   └── entities.ts                # Entity helper functions
├── data/
│   └── extracted-entities.json    # Extracted entities database
└── scripts/
    └── extract-entities.js        # AI extraction script
```

### Data Structure

The entity database (`src/content/entities/extracted-entities.json`) contains:
- **Posts**: Per-post entities, facts, figures, topics
- **Entities**: Aggregated companies, people, topics with mentions
- **Metadata**: Extraction timestamp and stats

### Updating Entity Data

To extract fresh entity data from all blog posts:

1. Set your FAL AI API key:
```bash
export FAL_KEY=your_fal_api_key_here
```

2. Run the extraction script:
```bash
pnpm run extract-entities
```

This will:
- Read all posts from `src/content/posts/`
- Use Claude 3.5 Sonnet via FAL AI to extract entities
- Generate `src/content/entities/extracted-entities.json`

## 🎨 Styling

The terminal uses:
- **Font**: DM Mono (monospace)
- **Colors**: 
  - Background: `#000000` (pwv-black)
  - Text: `#00d22e` (pwv-green)
  - Accents: `#00d2c8` (pwv-teal)
  - Errors: Red
- **Effects**:
  - Scanline animation
  - CRT glow overlay
  - Text shadow for phosphor effect

## 📱 Mobile Support

The terminal is fully responsive:
- Adjusted font sizes for mobile
- Touch-friendly input area
- Simplified ASCII art on small screens
- Helper text for mobile users

## 🛠️ Development

### Adding New Commands

1. Add command logic to `QueryEngine.ts`:
```typescript
private myNewCommand(): CommandResult {
  return {
    type: 'text',
    content: 'Your output here',
  };
}
```

2. Add command handler in `executeCommand()`:
```typescript
if (command === 'mycommand') {
  return this.myNewCommand();
}
```

3. Update help text in `showHelp()`.

### Extending Entity Types

To add new entity types (e.g., technologies, events):

1. Update `types.ts` interfaces
2. Modify `extract-entities.js` to extract the new type
3. Update `QueryEngine.ts` to query the new type
4. Add discovery commands for the new type

## 🎯 Future Enhancements

- Natural language queries: "Show me posts about AI and developer tools"
- Graph visualization: Toggle to see entity connections visually
- Export results: Download discoveries as markdown
- Saved searches: Bookmark favorite queries
- Social sharing: Share interesting discoveries
- Auto-complete: Tab completion for company/person names
- Typewriter animation: Animated text output for dramatic effect
- Sound effects: Optional typing sounds (toggleable)
- More easter eggs: Matrix mode, hidden commands, etc.

## 📝 Notes

- The sample `extracted-entities.json` contains data from ~9 posts
- Run `pnpm run extract-entities` with a FAL_KEY to extract from all ~60 posts
- Entity extraction takes ~1 minute per post (60-90 minutes total)
- All entity names are case-insensitive for searching
- Commands support partial matching for better UX

## 🐛 Troubleshooting

### "Entity not found" errors
- Check spelling (case-insensitive)
- Run `stats` to see available entities
- Re-run entity extraction if posts have changed

### Terminal not responding
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

### Entity extraction fails
- Verify FAL_KEY is set correctly
- Check internet connection
- Ensure sufficient API credits

---

Built with ❤️ by PWV using Astro, React, and Claude 3.5 Sonnet.
