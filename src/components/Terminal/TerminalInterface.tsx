import React, { useState, useEffect, useRef } from 'react';
import { QueryEngine } from './QueryEngine';
import type { CommandResult, HistoryEntry, ExtractedData } from './types';

interface TerminalInterfaceProps {
  entitiesData: ExtractedData;
}

// Calculate box width based on viewport
const getBoxWidth = (): number => {
  if (typeof window === 'undefined') return 64;
  
  const width = window.innerWidth;
  if (width < 640) return 40; // Mobile: smaller boxes
  if (width < 768) return 50; // Tablet
  return 64; // Desktop
};

const TerminalInterface: React.FC<TerminalInterfaceProps> = ({ entitiesData }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [boxWidth, setBoxWidth] = useState(64);
  const [queryEngine] = useState(() => {
    const width = typeof window !== 'undefined' ? getBoxWidth() : 64;
    return new QueryEngine(entitiesData as ExtractedData, width);
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreCommands, setShowMoreCommands] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Available commands for autocomplete
  const baseCommands = [
    'help',
    'companies',
    'list companies',
    'investors',
    'list investors',
    'people',
    'list people',
    'topics',
    'list topics',
    'quotes',
    'list quotes',
    'facts',
    'list facts',
    'figures',
    'list figures',
    'portfolio',
    'list portfolio',
    'stats',
    'surprise me',
    'surprise',
    'showcase random',
    'showcase company ',
    'showcase investor ',
    'showcase person ',
    'showcase topic ',
    'timeline ',
    'connections ',
    'clear',
    'cls',
    'whoami',
    'hello',
    'history',
    'fortune',
    'fortune | pwvsay',
    'pwvsay',
    'pwvsay ',
    'tomsay',
    'tomsay ',
    'dtsay',
    'dtsay ',
    'dpsay',
    'dpsay ',
    'fortune | cowsay',
    'fortune | pwvsay',
    'bork | cowsay',
    'bork | pwvsay',
    'cowsay',
    'cowsay ',
    'figlet ',
    'bork',
  ];

  // Get suggestions based on current input
  const getSuggestions = (inputText: string): string[] => {
    if (!inputText.trim()) return [];
    
    const lowerInput = inputText.toLowerCase();
    const filtered = baseCommands.filter(cmd => 
      cmd.toLowerCase().startsWith(lowerInput)
    );

    // Add entity-specific suggestions
    if (lowerInput.startsWith('showcase company ')) {
      const companyPrefix = inputText.substring(17);
      const companies = Object.keys(entitiesData.entities.companies)
        .filter(name => name.toLowerCase().startsWith(companyPrefix.toLowerCase()))
        .map(name => `showcase company ${name}`)
        .slice(0, 5);
      return companies;
    }

    if (lowerInput.startsWith('showcase investor ')) {
      const investorPrefix = inputText.substring(18);
      const investors = Object.keys(entitiesData.entities.investors)
        .filter(name => name.toLowerCase().startsWith(investorPrefix.toLowerCase()))
        .map(name => `showcase investor ${name}`)
        .slice(0, 5);
      return investors;
    }

    if (lowerInput.startsWith('showcase person ')) {
      const personPrefix = inputText.substring(16);
      const people = Object.keys(entitiesData.entities.people)
        .filter(name => name.toLowerCase().startsWith(personPrefix.toLowerCase()))
        .map(name => `showcase person ${name}`)
        .slice(0, 5);
      return people;
    }

    if (lowerInput.startsWith('showcase topic ')) {
      const topicPrefix = inputText.substring(15);
      const topics = Object.keys(entitiesData.entities.topics)
        .filter(name => name.toLowerCase().startsWith(topicPrefix.toLowerCase()))
        .map(name => `showcase topic ${name}`)
        .slice(0, 5);
      return topics;
    }

    // Remove duplicates by using a Set with trimmed commands as keys
    const unique = Array.from(new Set(filtered.map(cmd => cmd.trim())))
      .map(trimmed => filtered.find(cmd => cmd.trim() === trimmed)!)
      .slice(0, 8); // Limit to 8 suggestions

    return unique;
  };

  // Update suggestions when input changes
  useEffect(() => {
    const newSuggestions = getSuggestions(input);
    setSuggestions(newSuggestions);
    setSelectedSuggestionIndex(-1);
  }, [input]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle responsive box width and mobile detection
  useEffect(() => {
    const handleResize = () => {
      const newWidth = getBoxWidth();
      setBoxWidth(newWidth);
      queryEngine.setBoxWidth(newWidth);
      setIsMobile(window.innerWidth < 768);
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

  // Execute a command (used by both form submit and touch buttons)
  const executeCommand = (commandText: string) => {
    if (!commandText.trim()) return;

    // Clear command
    if (commandText.trim().toLowerCase() === 'clear' || commandText.trim().toLowerCase() === 'cls') {
      setHistory([]);
      setInput('');
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }

    // Execute command
    const result = queryEngine.executeCommand(commandText);
    
    const newEntry: HistoryEntry = {
      command: commandText,
      result,
      timestamp: new Date(),
    };

    setHistory([...history, newEntry]);
    setInput('');
    setHistoryIndex(-1);
    setShowMoreCommands(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);

    // Auto-open post if requested
    if (result.type === 'post' && result.data?.autoOpen && result.data?.url) {
      setTimeout(() => {
        window.open(result.data.url, '_blank');
      }, 500);
    }
  };

  // Handle command submission from form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  // Handle touch command button click
  const handleCommandClick = (command: string) => {
    executeCommand(command);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle suggestions navigation
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (suggestions.length > 0) {
          const selectedIndex = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
          setInput(suggestions[selectedIndex]);
          setSuggestions([]);
          setSelectedSuggestionIndex(-1);
        }
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        return;
      }
    }

    // Command history navigation (only when no suggestions)
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
      // Tab with no suggestions does nothing
    }
  };

  // Convert /news/ and /showcase/ paths to clickable links with trailing slashes
  const linkifyContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Match /news/ and /showcase/ paths (with or without trailing slash)
      const linkRegex = /\/(news|showcase)\/([a-z0-9-]+(?:\/[a-z0-9-]+)?)\/?/g;
      const parts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        
        // Add the link with trailing slash
        const pathType = match[1]; // 'news' or 'showcase'
        const pathRest = match[2]; // rest of path
        const displayPath = match[0]; // Keep original display (might not have /)
        const linkPath = `/${pathType}/${pathRest}/`; // Always add trailing slash for href
        
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

  // Get available numbers from last result
  const getAvailableNumbers = (): number[] => {
    if (history.length === 0) return [];
    const lastEntry = history[history.length - 1];
    const { result } = lastEntry;
    
    // Check if last result was a list type
    if (result.type === 'list' || result.type === 'company' || result.type === 'person' || result.type === 'topic' || result.type === 'investor') {
      // Count numbered items in the output (only if content is a string)
      const content = result.content || '';
      if (typeof content === 'string') {
        const matches = content.match(/^\s*\d+\./gm);
        if (matches) {
          return Array.from({ length: matches.length }, (_, i) => i + 1);
        }
      }
    }
    return [];
  };

  // Popular commands for touch mode
  const popularCommands = ['portfolio', 'companies', 'people', 'topics', 'quotes', 'facts'];
  const moreCommands = ['figures', 'investors', 'showcase random', 'stats', 'surprise me', 'fortune', 'pwvsay', 'cowsay', 'figlet PWV', 'bork', 'help', 'clear'];

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
            {isMobile ? 'Tap a number below to select' : 'Type a number to select an item from the list above'}
          </div>
        ) : null}
      </div>
    );
  };

  const availableNumbers = getAvailableNumbers();

  return (
    <div className="terminal-interface" style={{ display: 'block', minHeight: '60px' }}>
      {/* Output area */}
      <div 
        ref={outputRef}
        className="terminal-output mb-4 max-h-[60vh] md:max-h-[70vh] overflow-y-auto overflow-x-auto pr-2 scrollbar-thin scrollbar-thumb-pwv-green/30 scrollbar-track-transparent"
      >
        {history.map((entry, index) => renderOutput(entry, index))}
      </div>

      {/* Touch mode: Number selection buttons (mobile only, when numbers available) */}
      {isMobile && availableNumbers.length > 0 && (
        <div className="mb-4 pb-3 border-b border-pwv-green/30">
          <div className="text-xs text-pwv-teal mb-2 font-mono">Select:</div>
          <div className="flex flex-wrap gap-2">
            {availableNumbers.map((num) => (
              <button
                key={num}
                onClick={() => handleCommandClick(num.toString())}
                className="px-3 py-1.5 bg-pwv-green/10 border border-pwv-green/40 rounded text-pwv-green font-mono text-sm hover:bg-pwv-green/20 active:bg-pwv-green/30 transition-colors"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Touch mode: Command buttons (mobile only) */}
      {isMobile && (
        <div className="mb-4 pb-3 border-b border-pwv-green/30">
          <div className="text-xs text-pwv-teal mb-2 font-mono">Commands:</div>
          <div className="flex flex-wrap gap-2">
            {popularCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleCommandClick(cmd)}
                className="px-3 py-1.5 bg-pwv-green/10 border border-pwv-green/40 rounded text-pwv-green font-mono text-xs hover:bg-pwv-green/20 active:bg-pwv-green/30 transition-colors"
              >
                {cmd}
              </button>
            ))}
            <button
              onClick={() => setShowMoreCommands(!showMoreCommands)}
              className="px-3 py-1.5 bg-pwv-teal/10 border border-pwv-teal/40 rounded text-pwv-teal font-mono text-xs hover:bg-pwv-teal/20 active:bg-pwv-teal/30 transition-colors"
            >
              {showMoreCommands ? '− Less' : '+ More'}
            </button>
          </div>
          {showMoreCommands && (
            <div className="flex flex-wrap gap-2 mt-2">
              {moreCommands.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleCommandClick(cmd)}
                  className="px-3 py-1.5 bg-pwv-green/10 border border-pwv-green/40 rounded text-pwv-green font-mono text-xs hover:bg-pwv-green/20 active:bg-pwv-green/30 transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && !isMobile && (
        <div className="mb-2 bg-pwv-black/80 border border-pwv-green/40 rounded p-2 font-mono text-sm">
          <div className="text-pwv-teal/70 text-xs mb-1">Suggestions (Tab to complete, ↑↓ to navigate, Esc to dismiss):</div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  index === selectedSuggestionIndex
                    ? 'bg-pwv-green/20 text-pwv-green'
                    : 'text-pwv-green/70 hover:bg-pwv-green/10 hover:text-pwv-green'
                }`}
                onClick={() => {
                  setInput(suggestion);
                  setSuggestions([]);
                  setSelectedSuggestionIndex(-1);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

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
          placeholder={isMobile ? "Or type here..." : "Type 'help'..."}
          style={{ fontSize: '16px' }}
        />
        <span className="cursor-blink text-pwv-green text-base md:text-lg flex-shrink-0">█</span>
      </form>

      {/* Mobile helper */}
      {isMobile && history.length === 0 && (
        <div className="mt-3 text-xs text-pwv-green/50 space-y-1">
          <p>💡 Tap command buttons above or type below</p>
        </div>
      )}
    </div>
  );
};

export default TerminalInterface;
