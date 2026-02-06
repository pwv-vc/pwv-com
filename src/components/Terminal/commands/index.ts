// Fun/Easter Egg Commands
export { HelloCommand } from './fun/HelloCommand';
export { BorkCommand } from './fun/BorkCommand';
export { FigletCommand } from './fun/FigletCommand';
export { CowsayCommand } from './fun/CowsayCommand';
export { PwvsayCommand } from './fun/PwvsayCommand';

// List Commands
export { CompaniesCommand } from './list/CompaniesCommand';
export { PeopleCommand } from './list/PeopleCommand';
export { TopicsCommand } from './list/TopicsCommand';
export { InvestorsCommand } from './list/InvestorsCommand';

// Utility Commands
export { FortuneCommand } from './utility/FortuneCommand';
export { WhoamiCommand } from './utility/WhoamiCommand';
export { StatsCommand } from './utility/StatsCommand';

// Export base class
export { BaseCommand } from './BaseCommand';

// Export all command classes as an array for registration
import { HelloCommand } from './fun/HelloCommand';
import { BorkCommand } from './fun/BorkCommand';
import { FigletCommand } from './fun/FigletCommand';
import { CowsayCommand } from './fun/CowsayCommand';
import { PwvsayCommand } from './fun/PwvsayCommand';
import { CompaniesCommand } from './list/CompaniesCommand';
import { PeopleCommand } from './list/PeopleCommand';
import { TopicsCommand } from './list/TopicsCommand';
import { InvestorsCommand } from './list/InvestorsCommand';
import { FortuneCommand } from './utility/FortuneCommand';
import { WhoamiCommand } from './utility/WhoamiCommand';
import { StatsCommand } from './utility/StatsCommand';

export const allCommands = [
  // Fun commands
  HelloCommand,
  BorkCommand,
  FigletCommand,
  CowsayCommand,
  PwvsayCommand,
  // List commands
  CompaniesCommand,
  PeopleCommand,
  TopicsCommand,
  InvestorsCommand,
  // Utility commands
  FortuneCommand,
  WhoamiCommand,
  StatsCommand,
];
