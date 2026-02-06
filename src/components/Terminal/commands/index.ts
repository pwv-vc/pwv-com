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
export { QuotesCommand } from './list/QuotesCommand';
export { FactsCommand } from './list/FactsCommand';
export { FiguresCommand } from './list/FiguresCommand';
export { PortfolioCommand } from './list/PortfolioCommand';

// Utility Commands
export { FortuneCommand } from './utility/FortuneCommand';
export { WhoamiCommand } from './utility/WhoamiCommand';
export { StatsCommand } from './utility/StatsCommand';
export { HistoryCommand } from './utility/HistoryCommand';
export { ClearCommand } from './utility/ClearCommand';
export { SurpriseCommand } from './utility/SurpriseCommand';

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
import { QuotesCommand } from './list/QuotesCommand';
import { FactsCommand } from './list/FactsCommand';
import { FiguresCommand } from './list/FiguresCommand';
import { PortfolioCommand } from './list/PortfolioCommand';
import { FortuneCommand } from './utility/FortuneCommand';
import { WhoamiCommand } from './utility/WhoamiCommand';
import { StatsCommand } from './utility/StatsCommand';
import { HistoryCommand } from './utility/HistoryCommand';
import { ClearCommand } from './utility/ClearCommand';
import { SurpriseCommand } from './utility/SurpriseCommand';

export const allCommands = [
  // Fun commands (pipe commands must come before their base commands)
  CowsayCommand, // Must be before BorkCommand to match "bork | cowsay"
  PwvsayCommand, // Must be before BorkCommand to match "bork | pwvsay"
  HelloCommand,
  BorkCommand,
  FigletCommand,
  // List commands
  CompaniesCommand,
  PeopleCommand,
  TopicsCommand,
  InvestorsCommand,
  QuotesCommand,
  FactsCommand,
  FiguresCommand,
  PortfolioCommand,
  // Utility commands
  FortuneCommand,
  WhoamiCommand,
  StatsCommand,
  HistoryCommand,
  ClearCommand,
  SurpriseCommand,
];
