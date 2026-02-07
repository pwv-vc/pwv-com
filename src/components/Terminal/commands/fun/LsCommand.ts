import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class LsCommand extends BaseCommand {
  get name() {
    return 'ls';
  }
  get aliases() {
    return ['ls', 'll', 'dir'];
  }
  get description() {
    return 'List directory contents';
  }
  get usage() {
    return 'ls';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const output = `
total 42

drwxr-xr-x  10 pwv  staff   320 Feb  7 2026 portfolio/
drwxr-xr-x   8 pwv  staff   256 Feb  7 2026 team/
drwxr-xr-x  15 pwv  staff   480 Feb  7 2026 news/
drwxr-xr-x   4 pwv  staff   128 Feb  7 2026 ventures/
-rw-r--r--   1 pwv  staff  4096 Feb  7 2026 README.md
-rw-r--r--   1 pwv  staff  2048 Feb  7 2026 pwv.toml
-rwxr-xr-x   1 pwv  staff  8192 Feb  7 2026 invest.sh*

Type 'help' to see what you can actually do here.
    `;
    return { type: 'text', content: output };
  }
}
