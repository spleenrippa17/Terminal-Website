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
  type: "output" | "input" | "error" | "system" | "title" | "image";
  /** Only used when type === "image" */
  imageData?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

/** Renders an image with automatic CRT phosphor-green filter + scanlines */
function CrtImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="my-2 ml-2">
      <div className="crt-image-wrapper" style={{ maxWidth: 480 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} style={{ maxWidth: "100%", display: "block" }} />
      </div>
      {caption && (
        <span className="crt-image-caption">{caption}</span>
      )}
    </div>
  );
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
  "  DATE           - Show current stardate/time",
  "  ECHO <text>    - Print text to screen",
  "  EXIT           - Terminate session",
  "",
  "NAVIGATION TIPS:",
  "  Use UP/DOWN arrows to scroll command history",
  "  Press TAB to autocomplete commands",
  "  Type DIR to see what's available at any level",
  "",
  "NOTE: All sessions are monitored per Standing Order 937.",
  "",
];

const BOOT_SEQUENCE = [
  "WEYLAND-YUTANI CORPORATION",
  "CORE v9.1 — Corporate Operations Resource Engine",
  "Hyperdyne Systems 120-A/2 Mainframe",
  "",
  "Initializing primary memory banks...",
  "  256 TB primary storage ......................... OK",
  "  4 PB cold storage array ........................ OK",
  "  Tachyon relay uplink ........................... OK",
  "",
  "Loading CORE.SYS...",
  "Loading UPLINK.DRV...",
  "Loading SCIENCE.MOD...",
  "Loading SPECIAL_ORDERS.ENC ..................... [RESTRICTED]",
  "",
  "CORE v9.1 — Corporate Operations Resource Engine",
  "Copyright (C) 2099-2303 Weyland-Yutani Corporation.",
  "All rights reserved. Unauthorized access prosecuted.",
  "",
  "Uplink to Gateway Station... CONNECTED",
  "Stardate: 2303.02.27  //  All systems nominal.",
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

  const addImage = useCallback(
    (src: string, alt: string, caption?: string) => {
      setLines((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: "",
          type: "image",
          imageData: { src, alt, caption },
        },
      ]);
    },
    []
  );

  /** Display a page's text content and optional image */
  const showPage = useCallback(
    (page: SitePage) => {
      addLines(page.content);
      if (page.image) {
        addLine("");
        addLine("── IMAGE ──────────────────────────────────────────────────────", "system");
        addImage(page.image.src, page.image.alt, page.image.caption);
        addLine("───────────────────────────────────────────────────────────────", "system");
      }
      addLine("");
    },
    [addLines, addLine, addImage]
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
            showPage(homePage);
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
  }, [isBooting, bootIndex, addLines, addLine, showPage]);

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
    if (currentPath === "") return "CORE:\\>";
    return `CORE:\\${currentPath.toUpperCase().replace(/\//g, "\\")}\\>`;
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
            `Directory of CORE:\\${currentPath.toUpperCase().replace(/\//g, "\\")}`,
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
            addLine(`Current directory: CORE:\\${currentPath.toUpperCase().replace(/\//g, "\\")}`, "system");
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
                `Changed to: CORE:\\${parent.toUpperCase().replace(/\//g, "\\")}`,
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
            addLine("Changed to: CORE:\\", "system");
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
            addLine(`Changed to: CORE:\\${match.id.toUpperCase().replace(/\//g, "\\")}`, "system");
            addLine(`  ${match.title} - ${match.shortDesc}`, "system");
            addLine("");
            showPage(match);
          } else {
            playError();
            addLine(
              `CORE: Unknown path or access denied: '${target}'`,
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
            showPage(page);
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
              `Returned to: CORE:\\${prev.toUpperCase().replace(/\//g, "\\")}`,
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
          addLine("CORE v9.1 — Corporate Operations Resource Engine", "system");
          addLine("Copyright (C) 2099-2303 Weyland-Yutani Corporation", "system");
          addLine("Hyperdyne Systems 120-A/2 Mainframe", "system");
          addLine("Build: 2303.01.14 — Security hardened release", "system");
          addLine("");
          break;
        }

        case "DATE": {
          playSelect();
          const now = new Date();
          // Offset to year 2303: add (2303 - current_year) years
          const yearOffset = 2303 - now.getFullYear();
          const futureDate = new Date(now);
          futureDate.setFullYear(now.getFullYear() + yearOffset);
          const month = String(futureDate.getMonth() + 1).padStart(2, "0");
          const day = String(futureDate.getDate()).padStart(2, "0");
          const stardate = `${futureDate.getFullYear()}.${month}.${day}`;
          addLine("");
          addLine(`Stardate: ${stardate}`, "system");
          addLine(`Ship time: ${now.toLocaleTimeString("en-US", { hour12: false })} (synchronized)`, "system");
          addLine(`Uplink: Gateway Station — CONNECTED`, "system");
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
        case "LOGOUT": {
          playEnter();
          addLine("");
          addLine("Terminating CORE session...", "system");
          addLine("Flushing session logs to uplink...", "system");
          addLine("Uplink disconnected.", "system");
          addLine("");
          addLine("WEYLAND-YUTANI CORPORATION", "system");
          addLine('"Building Better Worlds."', "system");
          addLine("");
          setTimeout(() => {
            addLine("Session terminated. Goodbye, operative.", "system");
          }, 1500);
          break;
        }

        case "WHOAMI": {
          playSelect();
          addLine("OPERATIVE\\AUTHORIZED_USER", "system");
          addLine("Clearance level: STANDARD", "system");
          addLine("Note: Special Order 937 files require EXECUTIVE clearance.", "system");
          break;
        }

        case "TYPE": {
          if (!args) {
            addLine("Usage: TYPE <filename>", "error");
            playError();
          } else {
            playSelect();
            addLine(`Reading file: ${args}`, "system");
            addLine("File not found or access denied. Clearance insufficient.", "error");
          }
          break;
        }

        default: {
          playError();
          addLine(`CORE: '${cmd}' — command not recognized or access denied.`, "error");
          addLine("Type HELP for available commands.", "error");
          break;
        }
      }

      addLine("");
    },
    [addLine, addLines, showPage, currentPath, getPrompt, getCurrentChildren, pathHistory]
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
        {lines.map((line) =>
          line.type === "image" && line.imageData ? (
            <CrtImage
              key={line.id}
              src={line.imageData.src}
              alt={line.imageData.alt}
              caption={line.imageData.caption}
            />
          ) : (
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
          )
        )}
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
        <span>CORE v9.1 — W-Y CORP</span>
        <span>
          {currentPath
            ? `CORE:\\${currentPath.toUpperCase().replace(/\//g, "\\")}`
            : "CORE:\\"}
        </span>
        <span>
          {new Date().toLocaleTimeString("en-US", { hour12: false })}
        </span>
      </div>
    </div>
  );
}
