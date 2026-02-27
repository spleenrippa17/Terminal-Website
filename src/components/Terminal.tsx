"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  playKeyClick,
  playEnter,
  playError,
  playSelect,
  playBoot,
  playPageLoad,
  playBackspace,
  playTab,
  resumeAudio,
} from "@/lib/sounds";
import {
  siteTree,
  buildPageMap,
  getChildren,
  getParentPath,
  type SitePage,
} from "@/lib/siteContent";

interface TerminalLine {
  id: number;
  text: string;
  type: "output" | "input" | "error" | "system" | "title";
}

const pageMap = buildPageMap(siteTree);

const HELP_TEXT = [
  "╔══════════════════════════════════════════════════════════════╗",
  "║                    AVAILABLE COMMANDS                       ║",
  "╚══════════════════════════════════════════════════════════════╝",
  "",
  "  HELP           - Show this help message",
  "  DIR            - List available sections/pages",
  "  CD <name>      - Navigate into a section",
  "  CD ..          - Go up one level",
  "  CD /           - Return to root",
  "  VIEW           - View current page content",
  "  BACK           - Go back to previous location",
  "  CLS            - Clear the screen",
  "  VER            - Show system version",
  "  DATE           - Show current date/time",
  "  ECHO <text>    - Print text to screen",
  "  EXIT           - Disconnect from system",
  "",
  "NAVIGATION TIPS:",
  "  Use UP/DOWN arrows to scroll command history",
  "  Press TAB to autocomplete commands",
  "  Type DIR to see what's available at any level",
  "",
];

const BOOT_SEQUENCE = [
  "RETRONET BIOS v2.10  Copyright (C) 1998 RETRONET Systems",
  "640K Base Memory OK",
  "Extended Memory: 8192K",
  "",
  "Detecting hardware...",
  "  Sound Blaster 16 at I/O 220h, IRQ 5, DMA 1 ... OK",
  "  Network adapter at I/O 300h, IRQ 10 ........... OK",
  "  VGA display adapter ............................ OK",
  "",
  "Loading RETRONET.SYS...",
  "Loading NETWORK.DRV...",
  "Loading SOUND.DRV...",
  "",
  "RETRONET v2.1 - Online Information System",
  "Copyright (C) 1991-1998 RETRONET Systems. All rights reserved.",
  "",
  "Connecting to network... CONNECTED (9600 baud)",
  "",
  "Type HELP for available commands.",
  "Type DIR to see available sections.",
  "",
];

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBooting, setIsBooting] = useState(true);
  const [bootIndex, setBootIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioStarted = useRef(false);

  const addLine = useCallback(
    (text: string, type: TerminalLine["type"] = "output") => {
      setLines((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), text, type },
      ]);
    },
    []
  );

  const addLines = useCallback(
    (texts: string[], type: TerminalLine["type"] = "output") => {
      const newLines: TerminalLine[] = texts.map((text) => ({
        id: Date.now() + Math.random(),
        text,
        type,
      }));
      setLines((prev) => [...prev, ...newLines]);
    },
    []
  );

  // Boot sequence
  useEffect(() => {
    if (!isBooting) return;

    if (bootIndex >= BOOT_SEQUENCE.length) {
      const finishTimer = setTimeout(() => {
        setIsBooting(false);
        setIsReady(true);
        const homePage = pageMap.get("home");
        if (homePage) {
          setTimeout(() => {
            addLines(homePage.content);
            addLine("");
          }, 300);
        }
      }, 0);
      return () => clearTimeout(finishTimer);
    }

    const delay = bootIndex === 0 ? 200 : 60 + Math.random() * 40;
    const timer = setTimeout(() => {
      setLines((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: BOOT_SEQUENCE[bootIndex],
          type: "system",
        },
      ]);
      setBootIndex((i) => i + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isBooting, bootIndex, addLines, addLine]);

  // Play boot sound once
  useEffect(() => {
    if (isReady && !audioStarted.current) {
      audioStarted.current = true;
      setTimeout(() => playBoot(), 100);
    }
  }, [isReady]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // Focus input on click anywhere
  const handleScreenClick = useCallback(() => {
    resumeAudio();
    inputRef.current?.focus();
  }, []);

  const getPrompt = useCallback(() => {
    if (currentPath === "") return "C:\\>";
    return `C:\\${currentPath.toUpperCase().replace(/\//g, "\\")}\\>`;
  }, [currentPath]);

  const getCurrentChildren = useCallback((): SitePage[] => {
    return getChildren(currentPath, siteTree);
  }, [currentPath]);

  const processCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toUpperCase();
      const args = parts.slice(1).join(" ");

      // Echo the command
      addLine(`${getPrompt()} ${trimmed}`, "input");

      switch (cmd) {
        case "HELP": {
          playSelect();
          addLines(HELP_TEXT);
          break;
        }

        case "CLS":
        case "CLEAR": {
          playSelect();
          setLines([]);
          break;
        }

        case "DIR": {
          playSelect();
          const children = getCurrentChildren();
          const parentPage = currentPath ? pageMap.get(currentPath) : null;

          addLine("");
          addLine(
            `Directory of C:\\${currentPath.toUpperCase().replace(/\//g, "\\")}`,
            "system"
          );
          addLine("──────────────────────────────────────────────────────────────");
          addLine("");

          if (currentPath !== "") {
            addLine("  <DIR>  ..          [Parent directory]");
          }

          if (children.length === 0) {
            addLine("  (No subdirectories)");
          } else {
            children.forEach((child) => {
              const hasChildren = child.children && child.children.length > 0;
              const tag = hasChildren ? "<DIR>" : "     ";
              const name = child.title.padEnd(10);
              addLine(`  ${tag}  ${name}  ${child.shortDesc}`);
            });
          }

          if (parentPage) {
            addLine("");
            addLine(`  Current section: ${parentPage.title}`);
            addLine(`  Type VIEW to read this section's content.`);
          }

          addLine("");
          addLine(
            `  ${children.length} item(s) found.`
          );
          addLine("");
          break;
        }

        case "CD": {
          if (!args) {
            addLine(`Current directory: C:\\${currentPath.toUpperCase().replace(/\//g, "\\")}`, "system");
            break;
          }

          const target = args.trim();

          if (target === ".." || target === "BACK") {
            if (currentPath === "") {
              addLine("Already at root directory.", "error");
              playError();
            } else {
              const parent = getParentPath(currentPath);
              setPathHistory((h) => [...h, currentPath]);
              setCurrentPath(parent);
              playSelect();
              const parentPage = parent ? pageMap.get(parent) : null;
              addLine(
                `Changed to: C:\\${parent.toUpperCase().replace(/\//g, "\\")}`,
                "system"
              );
              if (parentPage) {
                addLine(`  ${parentPage.title} - ${parentPage.shortDesc}`, "system");
              } else {
                addLine("  [Root]", "system");
              }
            }
            break;
          }

          if (target === "/" || target === "\\") {
            setPathHistory((h) => [...h, currentPath]);
            setCurrentPath("");
            playSelect();
            addLine("Changed to: C:\\", "system");
            break;
          }

          // Find matching child
          const children = getCurrentChildren();
          const match = children.find(
            (c) =>
              c.title.toUpperCase() === target.toUpperCase() ||
              c.id.split("/").pop()?.toUpperCase() === target.toUpperCase()
          );

          if (match) {
            setPathHistory((h) => [...h, currentPath]);
            setCurrentPath(match.id);
            playPageLoad();
            addLine(`Changed to: C:\\${match.id.toUpperCase().replace(/\//g, "\\")}`, "system");
            addLine(`  ${match.title} - ${match.shortDesc}`, "system");
            addLine("");
            addLines(match.content);
            addLine("");
          } else {
            playError();
            addLine(
              `Bad command or file name: '${target}'`,
              "error"
            );
            addLine("Type DIR to see available sections.", "error");
          }
          break;
        }

        case "VIEW": {
          const page = currentPath ? pageMap.get(currentPath) : pageMap.get("home");
          if (page) {
            playPageLoad();
            addLine("");
            addLines(page.content);
            addLine("");
          } else {
            playError();
            addLine("No content available for current location.", "error");
          }
          break;
        }

        case "BACK": {
          if (pathHistory.length > 0) {
            const prev = pathHistory[pathHistory.length - 1];
            setPathHistory((h) => h.slice(0, -1));
            setCurrentPath(prev);
            playSelect();
            addLine(
              `Returned to: C:\\${prev.toUpperCase().replace(/\//g, "\\")}`,
              "system"
            );
          } else {
            playError();
            addLine("No previous location in history.", "error");
          }
          break;
        }

        case "VER": {
          playSelect();
          addLine("");
          addLine("RETRONET v2.1 - Online Information System", "system");
          addLine("Copyright (C) 1991-1998 RETRONET Systems", "system");
          addLine("MS-DOS Version 6.22", "system");
          addLine("");
          break;
        }

        case "DATE": {
          playSelect();
          const now = new Date();
          addLine("");
          addLine(`Current date: ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, "system");
          addLine(`Current time: ${now.toLocaleTimeString("en-US", { hour12: false })}`, "system");
          addLine("");
          break;
        }

        case "ECHO": {
          playSelect();
          if (args) {
            addLine(args);
          } else {
            addLine("ECHO is on.");
          }
          break;
        }

        case "EXIT":
        case "QUIT":
        case "BYE": {
          playEnter();
          addLine("");
          addLine("Thank you for using RETRONET.", "system");
          addLine("Disconnecting...", "system");
          addLine("");
          addLine("NO CARRIER", "system");
          addLine("");
          setTimeout(() => {
            addLine("Connection closed. Goodbye.", "system");
          }, 1500);
          break;
        }

        case "WHOAMI": {
          playSelect();
          addLine("GUEST\\USER", "system");
          break;
        }

        case "TYPE": {
          if (!args) {
            addLine("Usage: TYPE <filename>", "error");
            playError();
          } else {
            playSelect();
            addLine(`Reading file: ${args}`, "system");
            addLine("File not found or access denied.", "error");
          }
          break;
        }

        default: {
          playError();
          addLine(`'${cmd}' is not recognized as an internal or external command,`, "error");
          addLine("operable program or batch file.", "error");
          addLine("Type HELP for available commands.", "error");
          break;
        }
      }

      addLine("");
    },
    [addLine, addLines, currentPath, getPrompt, getCurrentChildren, pathHistory]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      resumeAudio();

      if (e.key === "Enter") {
        playEnter();
        const cmd = inputValue;
        setHistory((h) => (cmd.trim() ? [cmd, ...h.slice(0, 49)] : h));
        setHistoryIndex(-1);
        processCommand(cmd);
        setInputValue("");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        playKeyClick();
        setHistoryIndex((i) => {
          const next = Math.min(i + 1, history.length - 1);
          if (history[next] !== undefined) {
            setInputValue(history[next]);
          }
          return next;
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        playKeyClick();
        setHistoryIndex((i) => {
          const next = Math.max(i - 1, -1);
          setInputValue(next === -1 ? "" : history[next] ?? "");
          return next;
        });
      } else if (e.key === "Tab") {
        e.preventDefault();
        playTab();
        // Autocomplete
        const partial = inputValue.toUpperCase();
        const allCommands = [
          "HELP", "DIR", "CD", "VIEW", "BACK", "CLS", "VER", "DATE", "ECHO", "EXIT",
        ];
        const children = getCurrentChildren();
        const childNames = children.map((c) => c.title);
        const allOptions = [...allCommands, ...childNames];
        const matches = allOptions.filter((o) => o.startsWith(partial));
        if (matches.length === 1) {
          setInputValue(matches[0]);
        } else if (matches.length > 1) {
          addLine(`${getPrompt()} ${inputValue}`, "input");
          addLine(matches.join("  "), "system");
        }
      } else if (e.key === "Backspace") {
        playBackspace();
      } else if (e.key.length === 1) {
        playKeyClick();
      }
    },
    [inputValue, history, processCommand, getCurrentChildren, getPrompt, addLine]
  );

  const getLineClass = (type: TerminalLine["type"]) => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "input":
        return "text-green-300 font-bold";
      case "system":
        return "text-green-500 opacity-80";
      case "title":
        return "text-green-300 font-bold text-lg";
      default:
        return "text-green-400";
    }
  };

  return (
    <div
      className="crt-screen min-h-screen w-full bg-black flex flex-col cursor-text"
      onClick={handleScreenClick}
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      {/* Terminal output area */}
      <div
        className="flex-1 overflow-y-auto p-4 pb-2"
        style={{ maxHeight: "calc(100vh - 60px)" }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`text-sm leading-5 whitespace-pre ${getLineClass(line.type)}`}
            style={{
              textShadow:
                line.type === "error"
                  ? "0 0 8px rgba(255, 100, 100, 0.6)"
                  : "0 0 8px rgba(0, 255, 65, 0.4), 0 0 16px rgba(0, 255, 65, 0.2)",
            }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      {isReady && (
        <div
          className="flex items-center px-4 py-3 border-t border-green-900"
          style={{
            background: "rgba(0, 20, 0, 0.5)",
            boxShadow: "0 -2px 10px rgba(0, 255, 65, 0.1)",
          }}
        >
          <span
            className="text-sm text-green-400 mr-2 whitespace-nowrap"
            style={{
              textShadow: "0 0 8px rgba(0, 255, 65, 0.5)",
            }}
          >
            {getPrompt()}
          </span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-green-400 text-sm outline-none caret-green-400"
              style={{
                textShadow: "0 0 8px rgba(0, 255, 65, 0.5)",
                caretColor: "#00ff41",
              }}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          {/* Blinking cursor indicator */}
          <span
            className="text-green-400 text-sm cursor-blink ml-0.5"
            style={{ textShadow: "0 0 8px rgba(0, 255, 65, 0.8)" }}
          >
            █
          </span>
        </div>
      )}

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-1 text-xs"
        style={{
          background: "#001400",
          borderTop: "1px solid #003300",
          color: "#00aa2a",
        }}
      >
        <span>RETRONET v2.1</span>
        <span>
          {currentPath
            ? `C:\\${currentPath.toUpperCase().replace(/\//g, "\\")}`
            : "C:\\"}
        </span>
        <span>
          {new Date().toLocaleTimeString("en-US", { hour12: false })}
        </span>
      </div>
    </div>
  );
}
