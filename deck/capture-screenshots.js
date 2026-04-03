const puppeteer = require("puppeteer");
const path = require("path");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const BASE_URL = "http://localhost:5173";

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
  });

  // ── Page 1: Player 1 (Arjun) ──
  const page1 = await browser.newPage();
  await page1.goto(BASE_URL, { waitUntil: "networkidle2" });
  await delay(1000);

  // Screenshot 1: Lobby / Home
  await page1.screenshot({ path: path.join(SCREENSHOTS_DIR, "01-lobby.png") });
  console.log("✓ 01-lobby.png");

  // Create room - type name then click Create Room
  await page1.type("input", "Arjun");
  await delay(300);
  // Click "Create Room" button (first button)
  await page1.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const btn = btns.find((b) => b.textContent.includes("Create Room"));
    if (btn) btn.click();
  });
  await delay(1500);

  // Screenshot 2: Room code screen
  await page1.screenshot({
    path: path.join(SCREENSHOTS_DIR, "02-room-code.png"),
  });
  console.log("✓ 02-room-code.png");

  // Get room code - it's displayed as big text in the waiting room
  const roomCode = await page1.evaluate(() => {
    // The room code is in a div with tracking-[12px] and text-5xl
    const codeEl = document.querySelector(".text-5xl");
    return codeEl ? codeEl.textContent.trim() : null;
  });
  console.log(`Room code: ${roomCode}`);

  if (!roomCode) {
    console.error("Could not find room code!");
    await browser.close();
    return;
  }

  // ── Page 2: Player 2 (Dave) ──
  const page2 = await browser.newPage();
  await page2.goto(BASE_URL, { waitUntil: "networkidle2" });
  await delay(1000);

  // Type name
  await page2.type("input", "Dave");
  await delay(300);

  // Click "Join Room" button to switch to join mode
  await page2.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const btn = btns.find((b) => b.textContent.trim() === "Join Room");
    if (btn) btn.click();
  });
  await delay(500);

  // Now type the room code in the code input
  const codeInput = await page2.$$("input");
  // Second input should be the room code input
  if (codeInput.length > 1) {
    await codeInput[1].type(roomCode);
  } else {
    // Try the last input
    await codeInput[codeInput.length - 1].type(roomCode);
  }
  await delay(300);

  // Click "Join" button
  await page2.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const btn = btns.find(
      (b) => b.textContent.trim() === "Join" && !b.disabled
    );
    if (btn) btn.click();
  });
  await delay(1500);

  // Screenshot 3: Waiting room with 2 players (from host view)
  await page1.screenshot({
    path: path.join(SCREENSHOTS_DIR, "03-waiting-room.png"),
  });
  console.log("✓ 03-waiting-room.png");

  // Verify Dave joined
  const hasStart = await page1.evaluate(() => {
    return document.body.innerText.includes("Start Game");
  });
  console.log(`Start Game visible: ${hasStart}`);

  if (!hasStart) {
    console.error("Dave may not have joined. Check screenshots.");
    // Try to continue anyway
  }

  // Start game
  await page1.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const btn = btns.find((b) => b.textContent.includes("Start"));
    if (btn) btn.click();
  });
  await delay(2000);

  // Screenshot 4: Swap phase
  await page1.screenshot({
    path: path.join(SCREENSHOTS_DIR, "04-swap-phase.png"),
  });
  console.log("✓ 04-swap-phase.png");

  // Both players confirm ready
  for (const page of [page1, page2]) {
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const btn = btns.find(
        (b) =>
          b.textContent.includes("Ready") ||
          b.textContent.includes("Confirm") ||
          b.textContent.includes("Lock In")
      );
      if (btn) btn.click();
    });
    await delay(500);
  }
  await delay(2000);

  // Screenshot 5: Game board (player 1)
  await page1.screenshot({
    path: path.join(SCREENSHOTS_DIR, "05-gameboard-p1.png"),
  });
  console.log("✓ 05-gameboard-p1.png");

  // Screenshot 6: Game board (player 2)
  await page2.screenshot({
    path: path.join(SCREENSHOTS_DIR, "06-gameboard-p2.png"),
  });
  console.log("✓ 06-gameboard-p2.png");

  // Find whose turn it is and play a card
  const p1Turn = await page1.evaluate(() =>
    document.body.innerText.includes("Your turn")
  );
  const activePage = p1Turn ? page1 : page2;

  // Click first playable card in hand
  await activePage.evaluate(() => {
    // Hand cards are in the bottom area, clickable divs with Card components
    const handArea = document.querySelector(".flex.justify-center.items-end");
    if (handArea) {
      const cards = handArea.querySelectorAll('[class*="cursor-pointer"]');
      if (cards.length > 0) {
        cards[cards.length - 1].click(); // Best card (rightmost)
      }
    }
  });
  await delay(500);

  // Screenshot 7: Card selected with Play button visible
  await activePage.screenshot({
    path: path.join(SCREENSHOTS_DIR, "07-card-selected.png"),
  });
  console.log("✓ 07-card-selected.png");

  // Play the card
  await activePage.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const btn = btns.find((b) => b.textContent.includes("Play"));
    if (btn) btn.click();
  });
  await delay(1500);

  // Screenshot 8: After card played (shows pile with card)
  await page1.screenshot({
    path: path.join(SCREENSHOTS_DIR, "08-after-play.png"),
  });
  console.log("✓ 08-after-play.png");

  console.log("\nAll screenshots saved to:", SCREENSHOTS_DIR);
  await browser.close();
}

main().catch(console.error);
