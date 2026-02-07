/**
 * Box section interface for building structured terminal output
 */
export interface BoxSection {
  type: 'header' | 'keyValue' | 'list' | 'text' | 'empty' | 'divider';
  content?: string | string[] | Record<string, string>;
}

/**
 * Build simple text output from sections
 * Creates formatted terminal output without box borders
 */
export function buildBox(sections: BoxSection[]): string {
  const lines: string[] = [''];

  sections.forEach((section) => {
    switch (section.type) {
      case 'header':
        if (typeof section.content === 'string') {
          lines.push(`>> ${section.content.toUpperCase()}`);
          lines.push('─'.repeat(Math.min(50, section.content.length + 5)));
        }
        break;

      case 'keyValue':
        if (typeof section.content === 'object' && !Array.isArray(section.content)) {
          lines.push('');
          Object.entries(section.content).forEach(([key, value]) => {
            lines.push(`  ${key}: ${value}`);
          });
        }
        break;

      case 'list':
        if (Array.isArray(section.content)) {
          lines.push('');
          section.content.forEach((item) => {
            lines.push(`  ${item}`);
          });
        }
        break;

      case 'text':
        if (typeof section.content === 'string') {
          lines.push(section.content);
        }
        break;

      case 'empty':
        lines.push('');
        break;

      case 'divider':
        lines.push('');
        lines.push('─'.repeat(40));
        break;
    }
  });

  lines.push('');
  return lines.join('\n');
}

// Re-export BoxSection for convenience
export type { BoxSection as BoxSectionType };
