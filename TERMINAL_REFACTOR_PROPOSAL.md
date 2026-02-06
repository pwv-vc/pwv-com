# Terminal Commands Refactoring Proposal

## Problem
The `QueryEngine.ts` file is now **1800+ lines** and contains:
- Command parsing logic
- 20+ command implementations
- Data access methods
- Helper functions

This violates Single Responsibility Principle and makes maintenance difficult.

## Proposed Solution

### Directory Structure
```
src/components/Terminal/
├── QueryEngine.ts          # Main engine (routing only)
├── types.ts                # Existing types
├── commands/               # NEW: Individual command files
│   ├── index.ts           # Export all commands
│   ├── BaseCommand.ts     # Abstract base class
│   ├── list/              # List commands
│   │   ├── CompaniesCommand.ts
│   │   ├── PeopleCommand.ts
│   │   ├── TopicsCommand.ts
│   │   └── ...
│   ├── showcase/          # Showcase commands
│   │   ├── ShowcaseCommand.ts
│   │   └── ...
│   ├── fun/               # Easter eggs
│   │   ├── BorkCommand.ts
│   │   ├── CowsayCommand.ts
│   │   ├── PwvsayCommand.ts
│   │   ├── FigletCommand.ts
│   │   └── HelloCommand.ts
│   └── utility/           # Utility commands
│       ├── HelpCommand.ts
│       ├── ClearCommand.ts
│       ├── FortuneCommand.ts
│       └── WhoamiCommand.ts
```

### Base Command Interface
```typescript
// commands/BaseCommand.ts
export abstract class BaseCommand {
  constructor(protected data: ExtractedData) {}
  
  abstract get name(): string;
  abstract get aliases(): string[];
  abstract get description(): string;
  abstract get usage(): string;
  
  abstract execute(input: string, args: string[]): CommandResult;
  
  matches(input: string): boolean {
    const command = input.toLowerCase().trim();
    return command === this.name || 
           this.aliases.some(alias => command.startsWith(alias));
  }
}
```

### Example Command Implementation
```typescript
// commands/fun/HelloCommand.ts
import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class HelloCommand extends BaseCommand {
  get name() { return 'hello'; }
  get aliases() { return ['hello']; }
  get description() { return 'Random greeting'; }
  get usage() { return 'hello'; }

  execute(): CommandResult {
    const greetings = [
      'Hello, world!',
      'Hello, Dave.',
      'Hello there.',
      'hello?',
      'Hello, friend.',
      'Hi there! 👋',
      'Greetings!',
      'Hello, human.',
    ];

    const randomGreeting = greetings[
      Math.floor(Math.random() * greetings.length)
    ];

    return {
      type: 'text',
      content: `\n${randomGreeting}\n`,
    };
  }
}
```

### Refactored QueryEngine
```typescript
// QueryEngine.ts
import { allCommands } from './commands';

export class QueryEngine {
  private data: ExtractedData;
  private commands: BaseCommand[];
  
  constructor(data: ExtractedData, boxWidth: number = 64) {
    this.data = data;
    this.commands = allCommands.map(Cmd => new Cmd(data));
  }

  executeCommand(input: string): CommandResult {
    const command = input.trim().toLowerCase();
    
    // Special cases (clear, empty)
    if (!command) return { type: 'text', content: '' };
    if (command === 'clear' || command === 'cls') {
      return { type: 'text', content: '// Clear command - handled by component' };
    }

    // Find matching command
    const matchingCommand = this.commands.find(cmd => cmd.matches(input));
    
    if (matchingCommand) {
      const args = input.trim().split(' ').slice(1);
      return matchingCommand.execute(input, args);
    }

    return {
      type: 'error',
      content: `Unknown command: ${input}\nType 'help' for available commands.`,
    };
  }
}
```

### Commands Index
```typescript
// commands/index.ts
import { HelloCommand } from './fun/HelloCommand';
import { BorkCommand } from './fun/BorkCommand';
import { CowsayCommand } from './fun/CowsayCommand';
// ... import all commands

export const allCommands = [
  HelloCommand,
  BorkCommand,
  CowsayCommand,
  // ... all command classes
];

export {
  HelloCommand,
  BorkCommand,
  // ... re-export for direct access
};
```

## Benefits

### 1. **Maintainability**
- Each command is self-contained
- Easy to find and modify specific commands
- Clear separation of concerns

### 2. **Testability**
- Each command can be unit tested independently
- Mock data easily
- Test specific command logic in isolation

### 3. **Extensibility**
- Add new commands by creating a new file
- No need to modify the main QueryEngine
- Plugin-like architecture

### 4. **Discoverability**
- Commands are organized by category
- Easy to see all available commands
- Clear file naming conventions

### 5. **Collaboration**
- Multiple developers can work on different commands
- Reduced merge conflicts
- Clear ownership per command

## Migration Strategy

### Phase 1: Setup Infrastructure
1. Create `commands/` directory
2. Create `BaseCommand.ts`
3. Create `index.ts`

### Phase 2: Migrate Easter Eggs First
- HelloCommand
- BorkCommand
- CowsayCommand
- PwvsayCommand
- FigletCommand
(These are simplest and self-contained)

### Phase 3: Migrate List Commands
- CompaniesCommand
- PeopleCommand
- TopicsCommand
- etc.

### Phase 4: Migrate Complex Commands
- ShowcaseCommand (with subcommands)
- TimelineCommand
- ConnectionsCommand

### Phase 5: Clean Up
- Remove old methods from QueryEngine
- Update tests
- Update documentation

## Estimated Effort
- Setup: 1-2 hours
- Migration: 4-6 hours (20+ commands)
- Testing: 2-3 hours
- **Total: 7-11 hours**

## Risks & Mitigation

### Risk: Breaking changes
**Mitigation**: Keep old QueryEngine alongside new one, migrate gradually

### Risk: Performance overhead
**Mitigation**: Commands are lightweight classes, minimal overhead

### Risk: Over-engineering
**Mitigation**: Start simple, only add complexity as needed

## Recommendation

**Proceed with refactoring.** The current file is too large and will only grow.
The modular approach will pay dividends in:
- Maintainability
- Testing
- Collaboration
- Feature additions

## Next Steps

1. Review and approve this proposal
2. Create feature branch: `refactor/terminal-commands`
3. Implement Phase 1 (infrastructure)
4. Migrate one command as proof-of-concept
5. If successful, continue with full migration
