const fs = require('fs');
const path = require('path');

const eventsDir = path.join(__dirname, '../src/content/events');
const items = fs.readdirSync(eventsDir, { withFileTypes: true });

for (const item of items) {
  if (item.isDirectory()) {
    const indexPath = path.join(eventsDir, item.name, 'index.json');
    if (fs.existsSync(indexPath)) {
      const indexContent = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      const eventsDirPath = path.join(eventsDir, item.name, 'events');
      
      if (fs.existsSync(eventsDirPath)) {
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

        // Write combined file
        const outputPath = path.join(eventsDir, `${item.name}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2));
        console.log(`Built ${outputPath} with ${eventFiles.length} events`);
      }
    }
  }
}
