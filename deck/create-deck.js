const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

// Icon imports
const { FaGamepad, FaUsers, FaFire, FaEye, FaKeyboard, FaChartBar, FaSyncAlt, FaArrowsAltH, FaBan, FaForward, FaHandPointUp, FaCrown, FaRocket, FaSortAmountUp, FaBolt } = require("react-icons/fa");
const { MdSwapHoriz } = require("react-icons/md");

// ── Color Palette (Dark Gaming Theme) ──
const COLORS = {
  bg: "0D0D1A",          // deep dark navy
  bgCard: "1A1A2E",      // card background
  bgCardAlt: "16162B",   // alternate card
  accent: "6C5CE7",      // purple accent
  accentBright: "A29BFE", // light purple
  red: "FF6B6B",         // red for red 6
  green: "00D2A0",       // success green
  amber: "FBBF24",       // amber/gold
  white: "FFFFFF",
  textPrimary: "E8E8F0",
  textMuted: "8888A0",
  textDim: "55556A",
};

function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Helper to create fresh shadow objects (pptxgenjs mutates them)
const makeShadow = () => ({ type: "outer", blur: 12, offset: 3, angle: 135, color: "000000", opacity: 0.3 });
const makeGlow = () => ({ type: "outer", blur: 20, offset: 0, angle: 0, color: COLORS.accent, opacity: 0.15 });

async function createDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Shithead Online";
  pres.author = "Shithead Online";

  // Pre-render all icons
  const icons = {
    gamepad: await iconToBase64Png(FaGamepad, `#${COLORS.accent}`),
    users: await iconToBase64Png(FaUsers, `#${COLORS.accentBright}`),
    fire: await iconToBase64Png(FaFire, `#${COLORS.red}`),
    eye: await iconToBase64Png(FaEye, `#${COLORS.amber}`),
    keyboard: await iconToBase64Png(FaKeyboard, `#${COLORS.textMuted}`),
    chart: await iconToBase64Png(FaChartBar, `#${COLORS.green}`),
    sync: await iconToBase64Png(FaSyncAlt, `#${COLORS.green}`),
    swap: await iconToBase64Png(MdSwapHoriz, `#${COLORS.accentBright}`),
    ban: await iconToBase64Png(FaBan, `#${COLORS.red}`),
    forward: await iconToBase64Png(FaForward, `#${COLORS.amber}`),
    hand: await iconToBase64Png(FaHandPointUp, `#${COLORS.red}`),
    crown: await iconToBase64Png(FaCrown, `#${COLORS.amber}`),
    rocket: await iconToBase64Png(FaRocket, `#${COLORS.accent}`),
    sort: await iconToBase64Png(FaSortAmountUp, `#${COLORS.accentBright}`),
    bolt: await iconToBase64Png(FaBolt, `#${COLORS.amber}`),
    arrowsH: await iconToBase64Png(FaArrowsAltH, `#${COLORS.accentBright}`),
  };

  // ═══════════════════════════════════════════════════════
  // SLIDE 1: Title
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    // Decorative circles
    slide.addShape(pres.shapes.OVAL, { x: -1, y: -1.5, w: 4, h: 4, fill: { color: COLORS.accent, transparency: 92 } });
    slide.addShape(pres.shapes.OVAL, { x: 7.5, y: 3, w: 5, h: 5, fill: { color: COLORS.accent, transparency: 94 } });

    // Icon
    slide.addImage({ data: icons.gamepad, x: 4.5, y: 0.8, w: 1, h: 1 });

    // Title
    slide.addText("SHITHEAD", {
      x: 0.5, y: 1.8, w: 9, h: 1.2,
      fontSize: 54, fontFace: "Arial Black", bold: true,
      color: COLORS.white, align: "center", charSpacing: 8, margin: 0,
    });
    slide.addText("ONLINE", {
      x: 0.5, y: 2.85, w: 9, h: 0.7,
      fontSize: 28, fontFace: "Arial Black", bold: true,
      color: COLORS.accent, align: "center", charSpacing: 12, margin: 0,
    });

    // Tagline
    slide.addText("Play with your mates, anywhere.", {
      x: 1, y: 3.8, w: 8, h: 0.5,
      fontSize: 18, fontFace: "Georgia", italic: true,
      color: COLORS.textMuted, align: "center", margin: 0,
    });

    // Divider line
    slide.addShape(pres.shapes.LINE, {
      x: 3.5, y: 4.5, w: 3, h: 0,
      line: { color: COLORS.accent, width: 1.5, dashType: "solid" },
    });

    // Subtitle
    slide.addText("No downloads. No sign-up. Just cards.", {
      x: 1, y: 4.7, w: 8, h: 0.4,
      fontSize: 13, fontFace: "Calibri",
      color: COLORS.textDim, align: "center", margin: 0,
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 2: How It Works
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    slide.addText("HOW IT WORKS", {
      x: 0.5, y: 0.4, w: 9, h: 0.7,
      fontSize: 32, fontFace: "Arial Black", bold: true,
      color: COLORS.white, align: "center", margin: 0,
    });

    const steps = [
      { num: "1", title: "Create a Room", desc: "One person creates a game room and gets a 4-letter code", icon: icons.gamepad },
      { num: "2", title: "Share the Code", desc: "Send the room code to your mates via text, WhatsApp, wherever", icon: icons.users },
      { num: "3", title: "Play!", desc: "Everyone joins in their browser. No downloads, no accounts needed", icon: icons.rocket },
    ];

    steps.forEach((step, i) => {
      const x = 0.8 + i * 3;
      const y = 1.6;

      // Card background
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 2.6, h: 3.2,
        fill: { color: COLORS.bgCard },
        shadow: makeShadow(),
      });

      // Step number circle
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.95, y: y + 0.3, w: 0.7, h: 0.7,
        fill: { color: COLORS.accent },
      });
      slide.addText(step.num, {
        x: x + 0.95, y: y + 0.3, w: 0.7, h: 0.7,
        fontSize: 22, fontFace: "Arial Black", bold: true,
        color: COLORS.white, align: "center", valign: "middle", margin: 0,
      });

      // Icon
      slide.addImage({ data: step.icon, x: x + 0.95, y: y + 1.2, w: 0.7, h: 0.7 });

      // Title
      slide.addText(step.title, {
        x: x + 0.1, y: y + 2.0, w: 2.4, h: 0.45,
        fontSize: 16, fontFace: "Calibri", bold: true,
        color: COLORS.white, align: "center", margin: 0,
      });

      // Description
      slide.addText(step.desc, {
        x: x + 0.15, y: y + 2.4, w: 2.3, h: 0.7,
        fontSize: 11, fontFace: "Calibri",
        color: COLORS.textMuted, align: "center", margin: 0,
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 2b: Screenshots - Lobby & Room Code
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    slide.addText("SEE IT IN ACTION", {
      x: 0.5, y: 0.25, w: 9, h: 0.55,
      fontSize: 28, fontFace: "Arial Black", bold: true,
      color: COLORS.white, align: "center", margin: 0,
    });

    // Left: Lobby screenshot
    const lobbyImg = path.join(SCREENSHOTS_DIR, "01-lobby.png");
    if (fs.existsSync(lobbyImg)) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.4, y: 1.0, w: 4.5, h: 2.85,
        fill: { color: "000000" },
        shadow: makeShadow(),
      });
      slide.addImage({ path: lobbyImg, x: 0.45, y: 1.05, w: 4.4, h: 2.75, sizing: { type: "contain", w: 4.4, h: 2.75 } });
      slide.addText("Home Screen", {
        x: 0.4, y: 3.95, w: 4.5, h: 0.35,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: COLORS.accentBright, align: "center", margin: 0,
      });
      slide.addText("Enter your name and create or join a room", {
        x: 0.4, y: 4.25, w: 4.5, h: 0.3,
        fontSize: 10, fontFace: "Calibri",
        color: COLORS.textMuted, align: "center", margin: 0,
      });
    }

    // Right: Waiting room screenshot
    const waitImg = path.join(SCREENSHOTS_DIR, "03-waiting-room.png");
    if (fs.existsSync(waitImg)) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 5.1, y: 1.0, w: 4.5, h: 2.85,
        fill: { color: "000000" },
        shadow: makeShadow(),
      });
      slide.addImage({ path: waitImg, x: 5.15, y: 1.05, w: 4.4, h: 2.75, sizing: { type: "contain", w: 4.4, h: 2.75 } });
      slide.addText("Waiting Room", {
        x: 5.1, y: 3.95, w: 4.5, h: 0.35,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: COLORS.accentBright, align: "center", margin: 0,
      });
      slide.addText("Share the room code \u2014 friends join instantly", {
        x: 5.1, y: 4.25, w: 4.5, h: 0.3,
        fontSize: 10, fontFace: "Calibri",
        color: COLORS.textMuted, align: "center", margin: 0,
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 2c: Screenshots - Swap Phase & Gameplay
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    slide.addText("GAMEPLAY", {
      x: 0.5, y: 0.25, w: 9, h: 0.55,
      fontSize: 28, fontFace: "Arial Black", bold: true,
      color: COLORS.white, align: "center", margin: 0,
    });

    // Left: Swap phase
    const swapImg = path.join(SCREENSHOTS_DIR, "04-swap-phase.png");
    if (fs.existsSync(swapImg)) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.4, y: 1.0, w: 4.5, h: 2.85,
        fill: { color: "000000" },
        shadow: makeShadow(),
      });
      slide.addImage({ path: swapImg, x: 0.45, y: 1.05, w: 4.4, h: 2.75, sizing: { type: "contain", w: 4.4, h: 2.75 } });
      slide.addText("Swap Phase", {
        x: 0.4, y: 3.95, w: 4.5, h: 0.35,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: COLORS.accentBright, align: "center", margin: 0,
      });
      slide.addText("Choose which cards to keep face-up before play begins", {
        x: 0.4, y: 4.25, w: 4.5, h: 0.3,
        fontSize: 10, fontFace: "Calibri",
        color: COLORS.textMuted, align: "center", margin: 0,
      });
    }

    // Right: Gameplay with card selected
    const gameImg = path.join(SCREENSHOTS_DIR, "07-card-selected.png");
    if (fs.existsSync(gameImg)) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 5.1, y: 1.0, w: 4.5, h: 2.85,
        fill: { color: "000000" },
        shadow: makeShadow(),
      });
      slide.addImage({ path: gameImg, x: 5.15, y: 1.05, w: 4.4, h: 2.75, sizing: { type: "contain", w: 4.4, h: 2.75 } });
      slide.addText("In-Game", {
        x: 5.1, y: 3.95, w: 4.5, h: 0.35,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: COLORS.accentBright, align: "center", margin: 0,
      });
      slide.addText("Select cards, play them, and watch the pile grow", {
        x: 5.1, y: 4.25, w: 4.5, h: 0.3,
        fontSize: 10, fontFace: "Calibri",
        color: COLORS.textMuted, align: "center", margin: 0,
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 3: Card Rules
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    slide.addText("THE CARDS", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, fontFace: "Arial Black", bold: true,
      color: COLORS.white, align: "center", margin: 0,
    });

    const rules = [
      { rank: "2", name: "Reset", desc: "Play on anything, resets the pile", color: COLORS.green },
      { rank: "3", name: "Invisible", desc: "Beat the card underneath", color: COLORS.accentBright },
      { rank: "7", name: "Play Lower", desc: "Next player goes lower (not on Ace)", color: COLORS.amber },
      { rank: "8", name: "Skip", desc: "Skips the next player", color: COLORS.accent },
      { rank: "10", name: "Burn", desc: "Removes the entire pile", color: COLORS.red },
      { rank: "J", name: "Reverse", desc: "Reverses play direction", color: COLORS.accentBright },
      { rank: "4x", name: "Auto Burn", desc: "Four of a kind burns the pile", color: COLORS.red },
      { rank: "A", name: "Highest", desc: "The highest card in the game", color: COLORS.amber },
    ];

    // 2x4 grid
    rules.forEach((rule, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 0.5 + col * 2.35;
      const y = 1.15 + row * 2.15;

      // Card bg
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 2.15, h: 1.9,
        fill: { color: COLORS.bgCard },
        shadow: makeShadow(),
      });

      // Rank badge
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.1, y: y + 0.15, w: 0.55, h: 0.55,
        fill: { color: rule.color, transparency: 80 },
      });
      slide.addText(rule.rank, {
        x: x + 0.1, y: y + 0.15, w: 0.55, h: 0.55,
        fontSize: 18, fontFace: "Arial Black", bold: true,
        color: rule.color, align: "center", valign: "middle", margin: 0,
      });

      // Name
      slide.addText(rule.name, {
        x: x + 0.75, y: y + 0.15, w: 1.3, h: 0.35,
        fontSize: 14, fontFace: "Calibri", bold: true,
        color: COLORS.white, align: "left", valign: "middle", margin: 0,
      });

      // Description
      slide.addText(rule.desc, {
        x: x + 0.75, y: y + 0.45, w: 1.3, h: 0.35,
        fontSize: 10, fontFace: "Calibri",
        color: COLORS.textMuted, align: "left", valign: "top", margin: 0,
      });

      // Divider
      slide.addShape(pres.shapes.LINE, {
        x: x + 0.15, y: y + 0.95, w: 1.85, h: 0,
        line: { color: COLORS.textDim, width: 0.5, dashType: "dash" },
      });

      // Extra detail text
      const details = {
        "2": "The great equaliser",
        "3": "Sneaky and invisible",
        "7": "Can also play a 7 on a 7",
        "8": "Sorry, not sorry",
        "10": "Boom! Pile gone",
        "J": "Change things up",
        "4x": "Stack 'em up and watch it burn",
        "A": "Top dog, untouchable",
      };
      slide.addText(details[rule.rank] || "", {
        x: x + 0.15, y: y + 1.1, w: 1.85, h: 0.6,
        fontSize: 10, fontFace: "Georgia", italic: true,
        color: COLORS.textDim, align: "center", valign: "top", margin: 0,
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 4: The Red 6 Rule
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    // Decorative red glow
    slide.addShape(pres.shapes.OVAL, { x: 3, y: 0.5, w: 4, h: 4, fill: { color: COLORS.red, transparency: 94 } });

    slide.addText("THE RED 6 RULE", {
      x: 0.5, y: 0.4, w: 9, h: 0.7,
      fontSize: 36, fontFace: "Arial Black", bold: true,
      color: COLORS.red, align: "center", margin: 0,
    });

    // Red 6 card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.5, w: 4, h: 1.6,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.5, w: 0.08, h: 1.6,
      fill: { color: COLORS.red },
    });
    slide.addImage({ data: icons.hand, x: 1.1, y: 1.75, w: 0.6, h: 0.6 });
    slide.addText([
      { text: "Red 6", options: { fontSize: 18, bold: true, color: COLORS.red, breakLine: true } },
      { text: "Forces the next player to pick up the ENTIRE pile", options: { fontSize: 13, color: COLORS.textMuted } },
    ], {
      x: 1.9, y: 1.6, w: 2.7, h: 1.4,
      fontFace: "Calibri", valign: "middle", margin: 0,
    });

    // Black 6 deflect card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y: 1.5, w: 4, h: 1.6,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y: 1.5, w: 0.08, h: 1.6,
      fill: { color: COLORS.textMuted },
    });
    slide.addImage({ data: icons.arrowsH, x: 5.5, y: 1.75, w: 0.6, h: 0.6 });
    slide.addText([
      { text: "Black 6", options: { fontSize: 18, bold: true, color: COLORS.white, breakLine: true } },
      { text: "Deflects the red 6 to the next player", options: { fontSize: 13, color: COLORS.textMuted } },
    ], {
      x: 6.3, y: 1.6, w: 2.7, h: 1.4,
      fontFace: "Calibri", valign: "middle", margin: 0,
    });

    // The twist - big callout
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: 3.5, w: 7, h: 1.5,
      fill: { color: COLORS.red, transparency: 88 },
      shadow: makeShadow(),
    });
    slide.addText([
      { text: "THE CATCH", options: { fontSize: 20, bold: true, color: COLORS.amber, breakLine: true, fontFace: "Arial Black" } },
      { text: "The next player picks up EVERYTHING \u2014 including the black 6!", options: { fontSize: 15, color: COLORS.white, fontFace: "Calibri" } },
    ], {
      x: 1.7, y: 3.55, w: 6.6, h: 1.4,
      align: "center", valign: "middle", margin: 0,
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 5: Game Features
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    slide.addText("FEATURES", {
      x: 0.5, y: 0.35, w: 9, h: 0.6,
      fontSize: 32, fontFace: "Arial Black", bold: true,
      color: COLORS.white, align: "center", margin: 0,
    });

    const features = [
      { icon: icons.bolt, title: "Real-time Multiplayer", desc: "Instant updates via WebSockets \u2014 no lag, no refreshing" },
      { icon: icons.users, title: "Room Codes", desc: "Share a 4-letter code and your mates join in seconds" },
      { icon: icons.swap, title: "Card Swap Phase", desc: "Swap cards between hand and face-up before the game starts" },
      { icon: icons.sort, title: "Auto-Sorted Hand", desc: "Cards sorted worst to best, left to right \u2014 always tidy" },
      { icon: icons.eye, title: "Pile Peek", desc: "When a 3 is played, see the card underneath you need to beat" },
      { icon: icons.chart, title: "Stats Tracking", desc: "Wins, losses, streaks, and head-to-head records" },
      { icon: icons.keyboard, title: "Keyboard Shortcuts", desc: "Number keys to select, Enter to play, Space to pick up" },
    ];

    // 2-column layout, alternating rows
    features.forEach((feat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? 0.5 : 5.2;
      const y = 1.15 + row * 1.1;

      // Row bg
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 4.3, h: 0.95,
        fill: { color: COLORS.bgCard },
        shadow: makeShadow(),
      });

      // Icon
      slide.addImage({ data: feat.icon, x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55 });

      // Title + desc
      slide.addText(feat.title, {
        x: x + 0.9, y: y + 0.08, w: 3.2, h: 0.4,
        fontSize: 13, fontFace: "Calibri", bold: true,
        color: COLORS.white, align: "left", valign: "middle", margin: 0,
      });
      slide.addText(feat.desc, {
        x: x + 0.9, y: y + 0.45, w: 3.2, h: 0.4,
        fontSize: 10, fontFace: "Calibri",
        color: COLORS.textMuted, align: "left", valign: "top", margin: 0,
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 6: Let's Play
  // ═══════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bg };

    // Decorative
    slide.addShape(pres.shapes.OVAL, { x: 2, y: -0.5, w: 6, h: 6, fill: { color: COLORS.accent, transparency: 93 } });

    slide.addImage({ data: icons.rocket, x: 4.5, y: 0.8, w: 1, h: 1 });

    slide.addText("READY?", {
      x: 0.5, y: 1.9, w: 9, h: 0.9,
      fontSize: 48, fontFace: "Arial Black", bold: true,
      color: COLORS.white, align: "center", charSpacing: 6, margin: 0,
    });

    slide.addText("Ask me for the link and let's go!", {
      x: 1, y: 3.0, w: 8, h: 0.5,
      fontSize: 20, fontFace: "Georgia", italic: true,
      color: COLORS.textMuted, align: "center", margin: 0,
    });

    // CTA button shape
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.2, y: 3.8, w: 3.6, h: 0.8,
      fill: { color: COLORS.accent },
      shadow: makeShadow(),
    });
    slide.addText("LET'S PLAY", {
      x: 3.2, y: 3.8, w: 3.6, h: 0.8,
      fontSize: 20, fontFace: "Calibri", bold: true,
      color: COLORS.white, align: "center", valign: "middle",
      charSpacing: 4, margin: 0,
    });

    // Footer
    slide.addText("2\u20136 players  \u00B7  Browser only  \u00B7  No sign-up required", {
      x: 1, y: 4.9, w: 8, h: 0.4,
      fontSize: 12, fontFace: "Calibri",
      color: COLORS.textDim, align: "center", margin: 0,
    });
  }

  // ── Save ──
  const outputPath = "/Users/arjunasoysa/shithead/deck/shithead-online.pptx";
  await pres.writeFile({ fileName: outputPath });
  console.log(`Deck saved to ${outputPath}`);
}

createDeck().catch(console.error);
