import React, { useState, useEffect, useRef } from 'react';
import { QueryEngine } from './QueryEngine';
import type { CommandResult, HistoryEntry, ExtractedData } from './types';
import entitiesData from '../../data/extracted-entities.json';

// Calculate box width based on viewport
const getBoxWidth = (): number => {
  if (typeof window === 'undefined') return 64;
  
  const width = window.innerWidth;
  if (width < 640) return 40; // Mobile: smaller boxes
  if (width < 768) return 50; // Tablet
  return 64; // Desktop
};

const TerminalInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [boxWidth, setBoxWidth] = useState(64);
  const [queryEngine] = useState(() => {
    const width = typeof window !== 'undefined' ? getBoxWidth() : 64;
    return new QueryEngine(entitiesData as ExtractedData, width);
  });
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle responsive box width
  useEffect(() => {
    const handleResize = () => {
      const newWidth = getBoxWidth();
      setBoxWidth(newWidth);
      queryEngine.setBoxWidth(newWidth);
    };

    // Set initial width
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [queryEngine]);

  // Scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Clear command
    if (input.trim().toLowerCase() === 'clear' || input.trim().toLowerCase() === 'cls') {
      setHistory([]);
      setInput('');
      return;
    }

    // Execute command
    const result = queryEngine.executeCommand(input);
    
    const newEntry: HistoryEntry = {
      command: input,
      result,
      timestamp: new Date(),
    };

    setHistory([...history, newEntry]);
    setInput('');
    setHistoryIndex(-1);

    // Auto-open post if requested
    if (result.type === 'post' && result.data?.autoOpen && result.data?.url) {
      setTimeout(() => {
        window.open(result.data.url, '_blank');
      }, 500);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;

      const newIndex = historyIndex === -1 
        ? history.length - 1 
        : Math.max(0, historyIndex - 1);
      
      setHistoryIndex(newIndex);
      setInput(history[newIndex].command);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;
      
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(history[newIndex].command);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Could add autocomplete here
    }
  };

  // Convert /news/ paths to clickable links with trailing slashes
  const linkifyContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Match /news/ paths (with or without trailing slash)
      const newsLinkRegex = /\/news\/([a-z0-9-]+)\/?/g;
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = newsLinkRegex.exec(line)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        
        // Add the link with trailing slash
        const slug = match[1];
        const displayPath = match[0]; // Keep original display (might not have /)
        const linkPath = `/news/${slug}/`; // Always add trailing slash for href
        
        parts.push(
          <a
            key={`${lineIndex}-${match.index}`}
            href={linkPath}
            className="text-pwv-teal underline hover:text-pwv-green transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayPath}
          </a>
        );
        
        lastIndex = match.index + displayPath.length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <React.Fragment key={lineIndex}>
          {parts.length > 0 ? parts : line}
          {lineIndex < lines.length - 1 && '\n'}
        </React.Fragment>
      );
    });
  };

  // Render output with typewriter effect for certain types
  const renderOutput = (entry: HistoryEntry, index: number) => {
    const { result } = entry;
    const isError = result.type === 'error';
    const textColor = isError ? 'text-red-400' : 'text-pwv-green';

    return (
      <div key={index} className="mb-4">
        {/* Command echo */}
        <div className="text-pwv-green">
          <span className="text-pwv-teal">pwv:~ visitor$</span> {entry.command}
        </div>
        
        {/* Output */}
        {result.content && (
          <pre className={`${textColor} mt-2 whitespace-pre-wrap font-mono text-[0.65rem] sm:text-xs md:text-sm leading-relaxed break-words`}>
            {typeof result.content === 'string' ? linkifyContent(result.content) : result.content}
          </pre>
        )}

        {/* Helper text for lists */}
        {result.type === 'list' || result.type === 'company' || result.type === 'person' || result.type === 'topic' ? (
          <div className="mt-2 text-xs text-pwv-teal opacity-70">
            Type a number to select an item from the list above
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="terminal-interface" style={{ display: 'block', minHeight: '60px' }}>
      {/* Output area */}
      <div 
        ref={outputRef}
        className="terminal-output mb-4 max-h-[60vh] md:max-h-[70vh] overflow-y-auto overflow-x-auto pr-2 scrollbar-thin scrollbar-thumb-pwv-green/30 scrollbar-track-transparent"
      >
        {history.map((entry, index) => renderOutput(entry, index))}
      </div>

      {/* Input area - Always visible */}
      <form 
        onSubmit={handleSubmit} 
        className="terminal-input flex items-center gap-2 border-2 border-pwv-green rounded px-3 py-3 bg-pwv-black/50"
        style={{ display: 'flex' }}
      >
        <label className="text-pwv-teal whitespace-nowrap text-base md:text-lg flex-shrink-0 font-bold">
          pwv:~$
        </label>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-pwv-green outline-none font-mono text-base md:text-lg caret-pwv-green min-w-0"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          placeholder="Type 'help'..."
          style={{ fontSize: '16px' }}
        />
        <span className="cursor-blink text-pwv-green text-base md:text-lg flex-shrink-0">█</span>
      </form>

      {/* Mobile helper */}
      <div className="sm:hidden mt-3 text-xs text-pwv-green/50 space-y-1">
        <p>💡 Tap input to type commands</p>
        <p>Try: <span className="text-pwv-teal">help</span>, <span className="text-pwv-teal">surprise me</span></p>
      </div>
    </div>
  );
};

export default TerminalInterface;
