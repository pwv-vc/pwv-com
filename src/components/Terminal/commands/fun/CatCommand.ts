import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class CatCommand extends BaseCommand {
  get name() {
    return 'cat';
  }
  get aliases() {
    return ['cat'];
  }
  get description() {
    return 'Concatenate and display files';
  }
  get usage() {
    return 'cat <file>';
  }
  get category() {
    return 'other' as const;
  }

  execute(input: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'text',
        content: 'Usage: cat <file>\n\nTry: cat README.md',
      };
    }

    const filename = args[0].toLowerCase();

    if (filename === 'readme.md' || filename === 'readme') {
      return {
        type: 'text',
        content: `# PWV Terminal

Welcome to the PWV Terminal Interface!

## About PWV
PWV (Preston-Werner Ventures) is an early-stage venture capital
firm backing category-defining companies from zero to breakout.

## Getting Started
- Type 'help' to see available commands
- Type 'companies' to explore portfolio companies
- Type 'stats' to see corpus statistics
- Type 'surprise me' for something random

## Contact
- Newsletter: Type 'newsletter'
- Team: Type 'socials tom', 'socials dp', or 'socials dt'

Happy exploring!
        `,
      };
    }

    if (filename === 'pwv.toml') {
      return {
        type: 'text',
        content: `[venture]
name = "PWV"
description = "PWV (Preston-Werner Ventures) is an early-stage venture capital firm backing category-defining companies from zero to breakout."
founded = 2023
location = "San Francisco, CA and Boston, MA"

[partners]
tom = "Tom Preston-Werner"
dp = "David Price"
dt = "David Thyresson"

[focus]
stage = ["pre-seed", "seed"]
sectors = ["AI", "developer tools", "infrastructure"]

[philosophy]
ideas = "Ideas start with founders."
founders = "Founders start with PWV."
pwv = "PWV is the fund we wanted as early-stage founders."
motto = "PWV is the fund we wanted as early-stage founders."
        `,
      };
    }

    return {
      type: 'text',
      content: `cat: ${args[0]}: No such file or directory\n\nTry: cat README.md or cat pwv.toml`,
    };
  }
}
