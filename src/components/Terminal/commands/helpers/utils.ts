/**
 * Generate a URL-friendly slug from a name
 */
export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

/**
 * Format text to fit within a box width (pad or truncate)
 */
export function formatBoxLine(text: string, boxWidth: number = 64, padChar: string = ' '): string {
  const contentWidth = boxWidth - 4; // Remove 2 chars for borders + 2 for padding
  if (text.length > contentWidth) {
    return text.substring(0, contentWidth - 3) + '...';
  }
  return text.padEnd(contentWidth, padChar);
}

/**
 * Create box borders (currently unused but kept for potential future use)
 */
export function boxTop(width: number = 64): string {
  return '╔' + '═'.repeat(width - 2) + '╗';
}

export function boxBottom(width: number = 64): string {
  return '╚' + '═'.repeat(width - 2) + '╝';
}

export function boxDivider(width: number = 64): string {
  return '╠' + '═'.repeat(width - 2) + '╣';
}

export function boxLine(text: string, width: number = 64): string {
  return '║ ' + formatBoxLine(text, width) + ' ║';
}

export function boxEmpty(width: number = 64): string {
  return boxLine('', width);
}
