import { BaseCommand } from '../BaseCommand';
import type { CommandResult } from '../../types';

export class UptimeCommand extends BaseCommand {
  private startTime: Date;

  constructor(data: any, boxWidth: number = 64) {
    super(data, boxWidth);
    this.startTime = new Date();
  }

  get name() {
    return 'uptime';
  }
  get aliases() {
    return ['uptime'];
  }
  get description() {
    return 'Show system uptime';
  }
  get usage() {
    return 'uptime';
  }
  get category() {
    return 'other' as const;
  }

  execute(): CommandResult {
    const now = new Date();
    const diff = now.getTime() - this.startTime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let uptimeStr = '';
    if (days > 0) {
      uptimeStr = `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hr${hours % 24 !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      uptimeStr = `${hours} hr${hours > 1 ? 's' : ''}, ${minutes % 60} min${minutes % 60 !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      uptimeStr = `${minutes} min${minutes > 1 ? 's' : ''}, ${seconds % 60} sec${seconds % 60 !== 1 ? 's' : ''}`;
    } else {
      uptimeStr = `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    const totalCompanies = Object.keys(this.data.entities.companies).length;
    const totalPosts = Object.keys(this.data.posts).length;

    return {
      type: 'text',
      content: `Terminal uptime: ${uptimeStr}

PWV Stats:
  - ${totalCompanies} companies in database
  - ${totalPosts} posts analyzed
  - Serving innovation since 2012

Type 'stats' for more detailed statistics.
      `,
    };
  }
}
