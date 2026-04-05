import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// ── Maze generation (recursive backtracker) ──────────────────────────
const MAZE_W = 15;
const MAZE_H = 15;
const CELL = 4; // world-units per cell

type Cell = { x: number; y: number; walls: { N: boolean; S: boolean; E: boolean; W: boolean } };

function generateMaze(): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < MAZE_H; y++) {
    grid[y] = [];
    for (let x = 0; x < MAZE_W; x++) {
      grid[y][x] = { x, y, walls: { N: true, S: true, E: true, W: true } };
    }
  }
  const visited = new Set<string>();
  const stack: Cell[] = [];
  const start = grid[0][0];
  visited.add('0,0');
  stack.push(start);

  while (stack.length) {
    const cur = stack[stack.length - 1];
    const neighbors: { cell: Cell; dir: 'N' | 'S' | 'E' | 'W'; opp: 'N' | 'S' | 'E' | 'W' }[] = [];
    const dirs: { dx: number; dy: number; dir: 'N' | 'S' | 'E' | 'W'; opp: 'N' | 'S' | 'E' | 'W' }[] = [
      { dx: 0, dy: -1, dir: 'N', opp: 'S' },
      { dx: 0, dy: 1, dir: 'S', opp: 'N' },
      { dx: 1, dy: 0, dir: 'E', opp: 'W' },
      { dx: -1, dy: 0, dir: 'W', opp: 'E' },
    ];
    for (const d of dirs) {
      const nx = cur.x + d.dx;
      const ny = cur.y + d.dy;
      if (nx >= 0 && nx < MAZE_W && ny >= 0 && ny < MAZE_H && !visited.has(`${nx},${ny}`)) {
        neighbors.push({ cell: grid[ny][nx], dir: d.dir, opp: d.opp });
      }
    }
    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      cur.walls[pick.dir] = false;
      pick.cell.walls[pick.opp] = false;
      visited.add(`${pick.cell.x},${pick.cell.y}`);
      stack.push(pick.cell);
    }
  }
  return grid;
}

// ── Obstacle placement ───────────────────────────────────────────────
interface Obstacle {
  x: number;
  z: number;
  width: number;
  height: number;
}

function placeObstacles(grid: Cell[][]): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (let y = 0; y < MAZE_H; y++) {
    for (let x = 0; x < MAZE_W; x++) {
      if (Math.random() < 0.3) {
        const cx = x * CELL + CELL / 2;
        const cz = y * CELL + CELL / 2;
        obstacles.push({ x: cx, z: cz, width: 1.5, height: 0.6 });
      }
    }
  }
  return obstacles.filter(o => !(o.x < CELL && o.z < CELL));
}

// ── Coin placement ───────────────────────────────────────────────────
interface Coin {
  x: number;
  z: number;
  collected: boolean;
}

function placeCoins(grid: Cell[][]): Coin[] {
  const coins: Coin[] = [];
  for (let y = 0; y < MAZE_H; y++) {
    for (let x = 0; x < MAZE_W; x++) {
      if ((x + y) % 2 === 0 && !(x === 0 && y === 0)) {
        coins.push({ x: x * CELL + CELL / 2, z: y * CELL + CELL / 2, collected: false });
      }
    }
  }
  return coins;
}

// ── Detect mobile ────────────────────────────────────────────────────
function isMobile(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ── Main component ───────────────────────────────────────────────────
interface Props {
  onExit: () => void;
}

export function JungleMazeRunner({ onExit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    keys: {} as Record<string, boolean>,
    yaw: 0,
    pitch: 0,
    playerY: 1.6,
    velY: 0,
    onGround: true,
    score: 0,
    totalCoins: 0,
    won: false,
    gameTime: 0,
    started: false,
    // Touch controls
    joystickX: 0,
    joystickY: 0,
    touchLookId: -1,
    touchJoystickId: -1,
    lastTouchX: 0,
    lastTouchY: 0,
  });

  const handleExit = useCallback(() => onExit(), [onExit]);

  useEffect(() => {
    const container = containerRef.current!;
    const state = stateRef.current;
    const mobile = isMobile();

    // ── Renderer & scene ──
    const renderer = new THREE.WebGLRenderer({ antialias: !mobile });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !mobile;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a3a1a);
    scene.fog = new THREE.Fog(0x1a3a1a, 2, 28);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(CELL / 2, 1.6, CELL / 2);

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0x3a6b3a, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffe8a0, 0.8);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = !mobile;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xaaff77, 0.5, 50, Math.PI / 4);
    spotLight.position.set(MAZE_W * CELL / 2, 15, MAZE_H * CELL / 2);
    scene.add(spotLight);

    // ── Materials ──
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x2d5a1e });
    const wallDarkMat = new THREE.MeshLambertMaterial({ color: 0x1e3d14 });
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x3b2f1a });
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffa500, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 });
    const obstacleMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1a });
    const vineMat = new THREE.MeshLambertMaterial({ color: 0x1a6b1a });
    const exitMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff44, emissiveIntensity: 0.8, transparent: true, opacity: 0.7 });

    // ── Floor ──
    const floorGeo = new THREE.PlaneGeometry(MAZE_W * CELL, MAZE_H * CELL);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((MAZE_W * CELL) / 2, 0, (MAZE_H * CELL) / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Ceiling (canopy) ──
    const ceilingGeo = new THREE.PlaneGeometry(MAZE_W * CELL, MAZE_H * CELL);
    const ceilingMat2 = new THREE.MeshLambertMaterial({ color: 0x0d3d0d, side: THREE.DoubleSide });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat2);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set((MAZE_W * CELL) / 2, 4, (MAZE_H * CELL) / 2);
    scene.add(ceiling);

    // ── Build maze walls ──
    const grid = generateMaze();
    const wallGeo = new THREE.BoxGeometry(CELL, 4, 0.3);
    const wallGeoSide = new THREE.BoxGeometry(0.3, 4, CELL);

    for (let y = 0; y < MAZE_H; y++) {
      for (let x = 0; x < MAZE_W; x++) {
        const cell = grid[y][x];
        const cx = x * CELL + CELL / 2;
        const cz = y * CELL + CELL / 2;
        const mat = (x + y) % 2 === 0 ? wallMat : wallDarkMat;

        if (cell.walls.N) {
          const w = new THREE.Mesh(wallGeo, mat);
          w.position.set(cx, 2, cz - CELL / 2);
          w.castShadow = true;
          scene.add(w);
        }
        if (cell.walls.S) {
          const w = new THREE.Mesh(wallGeo, mat);
          w.position.set(cx, 2, cz + CELL / 2);
          w.castShadow = true;
          scene.add(w);
        }
        if (cell.walls.E) {
          const w = new THREE.Mesh(wallGeoSide, mat);
          w.position.set(cx + CELL / 2, 2, cz);
          w.castShadow = true;
          scene.add(w);
        }
        if (cell.walls.W) {
          const w = new THREE.Mesh(wallGeoSide, mat);
          w.position.set(cx - CELL / 2, 2, cz);
          w.castShadow = true;
          scene.add(w);
        }

        if (Math.random() < 0.15) {
          const vineGeo = new THREE.CylinderGeometry(0.03, 0.05, 3 + Math.random() * 2, 4);
          const vine = new THREE.Mesh(vineGeo, vineMat);
          vine.position.set(cx + (Math.random() - 0.5) * 2, 2.5, cz + (Math.random() - 0.5) * 2);
          scene.add(vine);
        }
      }
    }

    // ── Exit marker ──
    const exitX = (MAZE_W - 1) * CELL + CELL / 2;
    const exitZ = (MAZE_H - 1) * CELL + CELL / 2;
    const exitGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 16);
    const exitBeam = new THREE.Mesh(exitGeo, exitMat);
    exitBeam.position.set(exitX, 1.5, exitZ);
    scene.add(exitBeam);

    const exitRingGeo = new THREE.TorusGeometry(1.2, 0.1, 8, 24);
    const exitRing = new THREE.Mesh(exitRingGeo, exitMat);
    exitRing.position.set(exitX, 0.5, exitZ);
    exitRing.rotation.x = Math.PI / 2;
    scene.add(exitRing);

    // ── Coins ──
    const coins = placeCoins(grid);
    state.totalCoins = coins.length;
    const coinMeshes: THREE.Mesh[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
    for (const c of coins) {
      const m = new THREE.Mesh(coinGeo, coinMat);
      m.position.set(c.x, 1.2, c.z);
      m.rotation.x = Math.PI / 2;
      scene.add(m);
      coinMeshes.push(m);
    }

    const coinLights: THREE.PointLight[] = [];
    if (!mobile) {
      for (const c of coins) {
        const light = new THREE.PointLight(0xffd700, 0.3, 4);
        light.position.set(c.x, 1.5, c.z);
        scene.add(light);
        coinLights.push(light);
      }
    }

    // ── Obstacles ──
    const obstacles = placeObstacles(grid);
    for (const o of obstacles) {
      const geo = new THREE.BoxGeometry(o.width, o.height, o.width);
      const m = new THREE.Mesh(geo, obstacleMat);
      m.position.set(o.x, o.height / 2, o.z);
      m.castShadow = true;
      scene.add(m);
    }

    // ── Collision helpers ──
    const PLAYER_R = 0.35;
    const WALL_HALF = 0.15;

    function collidesWall(px: number, pz: number): boolean {
      const cellX = Math.floor(px / CELL);
      const cellZ = Math.floor(pz / CELL);

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cx = cellX + dx;
          const cz = cellZ + dy;
          if (cx < 0 || cx >= MAZE_W || cz < 0 || cz >= MAZE_H) {
            if (px - PLAYER_R < 0 || px + PLAYER_R > MAZE_W * CELL ||
                pz - PLAYER_R < 0 || pz + PLAYER_R > MAZE_H * CELL) return true;
            continue;
          }
          const cell = grid[cz][cx];
          const wx = cx * CELL + CELL / 2;
          const wz = cz * CELL + CELL / 2;

          if (cell.walls.N) {
            const wallZ = wz - CELL / 2;
            if (px + PLAYER_R > wx - CELL / 2 && px - PLAYER_R < wx + CELL / 2 &&
                pz + PLAYER_R > wallZ - WALL_HALF && pz - PLAYER_R < wallZ + WALL_HALF) return true;
          }
          if (cell.walls.S) {
            const wallZ = wz + CELL / 2;
            if (px + PLAYER_R > wx - CELL / 2 && px - PLAYER_R < wx + CELL / 2 &&
                pz + PLAYER_R > wallZ - WALL_HALF && pz - PLAYER_R < wallZ + WALL_HALF) return true;
          }
          if (cell.walls.E) {
            const wallX = wx + CELL / 2;
            if (pz + PLAYER_R > wz - CELL / 2 && pz - PLAYER_R < wz + CELL / 2 &&
                px + PLAYER_R > wallX - WALL_HALF && px - PLAYER_R < wallX + WALL_HALF) return true;
          }
          if (cell.walls.W) {
            const wallX = wx - CELL / 2;
            if (pz + PLAYER_R > wz - CELL / 2 && pz - PLAYER_R < wz + CELL / 2 &&
                px + PLAYER_R > wallX - WALL_HALF && px - PLAYER_R < wallX + WALL_HALF) return true;
          }
        }
      }
      return false;
    }

    function getGroundHeight(px: number, pz: number): number {
      for (const o of obstacles) {
        const hw = o.width / 2;
        if (px > o.x - hw && px < o.x + hw && pz > o.z - hw && pz < o.z + hw) {
          return o.height;
        }
      }
      return 0;
    }

    // ── Keyboard Input ──
    const onKeyDown = (e: KeyboardEvent) => { state.keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); };
    const onKeyUp = (e: KeyboardEvent) => { state.keys[e.code] = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === renderer.domElement) {
        state.yaw -= e.movementX * 0.002;
        state.pitch -= e.movementY * 0.002;
        state.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.pitch));
      }
    };
    const onClick = () => {
      if (!state.started) state.started = true;
      if (!mobile) renderer.domElement.requestPointerLock();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // ── Touch Controls UI (mobile only) ──
    let joystickOuter: HTMLDivElement | null = null;
    let joystickInner: HTMLDivElement | null = null;
    let jumpBtn: HTMLDivElement | null = null;
    let exitBtn: HTMLDivElement | null = null;

    if (mobile) {
      // Virtual joystick (bottom-left)
      joystickOuter = document.createElement('div');
      joystickOuter.style.cssText = `
        position:absolute;bottom:40px;left:40px;width:130px;height:130px;
        border-radius:50%;border:3px solid rgba(255,255,255,0.25);
        background:rgba(0,0,0,0.3);z-index:20;touch-action:none;pointer-events:auto;
      `;
      container.appendChild(joystickOuter);

      joystickInner = document.createElement('div');
      joystickInner.style.cssText = `
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:50px;height:50px;border-radius:50%;
        background:rgba(255,255,255,0.4);pointer-events:none;
      `;
      joystickOuter.appendChild(joystickInner);

      // Jump button (bottom-right)
      jumpBtn = document.createElement('div');
      jumpBtn.style.cssText = `
        position:absolute;bottom:60px;right:50px;width:80px;height:80px;
        border-radius:50%;border:3px solid rgba(0,255,136,0.5);
        background:rgba(0,255,136,0.15);z-index:20;touch-action:none;pointer-events:auto;
        display:flex;align-items:center;justify-content:center;
        font-family:monospace;font-size:16px;font-weight:bold;color:rgba(0,255,136,0.8);
        user-select:none;-webkit-user-select:none;
      `;
      jumpBtn.textContent = 'JUMP';
      container.appendChild(jumpBtn);

      // Exit button (top-left)
      exitBtn = document.createElement('div');
      exitBtn.style.cssText = `
        position:absolute;top:16px;left:16px;padding:8px 16px;
        border-radius:8px;border:2px solid rgba(255,100,100,0.4);
        background:rgba(0,0,0,0.5);z-index:20;pointer-events:auto;
        font-family:monospace;font-size:14px;color:rgba(255,100,100,0.8);
        user-select:none;-webkit-user-select:none;
      `;
      exitBtn.textContent = 'EXIT';
      container.appendChild(exitBtn);

      // ── Joystick touch handling ──
      const joystickRadius = 50;

      const onJoystickStart = (e: TouchEvent) => {
        e.preventDefault();
        if (!state.started) state.started = true;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          state.touchJoystickId = t.identifier;
          updateJoystick(t);
        }
      };

      const updateJoystick = (t: Touch) => {
        const rect = joystickOuter!.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = t.clientX - cx;
        let dy = t.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > joystickRadius) {
          dx = (dx / dist) * joystickRadius;
          dy = (dy / dist) * joystickRadius;
        }
        state.joystickX = dx / joystickRadius; // -1 to 1
        state.joystickY = dy / joystickRadius; // -1 to 1
        if (joystickInner) {
          joystickInner.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        }
      };

      const onJoystickMove = (e: TouchEvent) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === state.touchJoystickId) {
            updateJoystick(t);
          }
        }
      };

      const onJoystickEnd = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === state.touchJoystickId) {
            state.touchJoystickId = -1;
            state.joystickX = 0;
            state.joystickY = 0;
            if (joystickInner) {
              joystickInner.style.transform = 'translate(-50%, -50%)';
            }
          }
        }
      };

      joystickOuter.addEventListener('touchstart', onJoystickStart, { passive: false });
      joystickOuter.addEventListener('touchmove', onJoystickMove, { passive: false });
      joystickOuter.addEventListener('touchend', onJoystickEnd);
      joystickOuter.addEventListener('touchcancel', onJoystickEnd);

      // ── Jump button touch handling ──
      const onJumpStart = (e: TouchEvent) => {
        e.preventDefault();
        if (!state.started) state.started = true;
        state.keys['Space'] = true;
      };
      const onJumpEnd = (e: TouchEvent) => {
        e.preventDefault();
        state.keys['Space'] = false;
      };
      jumpBtn.addEventListener('touchstart', onJumpStart, { passive: false });
      jumpBtn.addEventListener('touchend', onJumpEnd);
      jumpBtn.addEventListener('touchcancel', onJumpEnd);

      // ── Exit button ──
      exitBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleExit();
      }, { passive: false });

      // ── Right side of screen: swipe to look ──
      const onLookStart = (e: TouchEvent) => {
        // Only handle touches on the canvas (not on controls)
        if (e.target !== renderer.domElement) return;
        if (!state.started) state.started = true;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          // Only use touches on the right half for looking
          if (t.clientX > window.innerWidth * 0.35) {
            state.touchLookId = t.identifier;
            state.lastTouchX = t.clientX;
            state.lastTouchY = t.clientY;
          }
        }
      };

      const onLookMove = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === state.touchLookId) {
            const dx = t.clientX - state.lastTouchX;
            const dy = t.clientY - state.lastTouchY;
            state.yaw -= dx * 0.004;
            state.pitch -= dy * 0.004;
            state.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.pitch));
            state.lastTouchX = t.clientX;
            state.lastTouchY = t.clientY;
          }
        }
      };

      const onLookEnd = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === state.touchLookId) {
            state.touchLookId = -1;
          }
        }
      };

      renderer.domElement.addEventListener('touchstart', onLookStart, { passive: true });
      renderer.domElement.addEventListener('touchmove', onLookMove, { passive: true });
      renderer.domElement.addEventListener('touchend', onLookEnd);
      renderer.domElement.addEventListener('touchcancel', onLookEnd);
    }

    // ── HUD ──
    const hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;font-family:monospace;';
    container.appendChild(hud);

    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = `position:absolute;top:20px;${mobile ? 'left:50%;transform:translateX(-50%)' : 'left:20px'};color:#ffd700;font-size:${mobile ? '18px' : '24px'};text-shadow:0 0 10px #ffa500;`;
    hud.appendChild(scoreEl);

    const timerEl = document.createElement('div');
    timerEl.style.cssText = `position:absolute;top:20px;right:20px;color:#88ff88;font-size:${mobile ? '18px' : '24px'};text-shadow:0 0 10px #44ff44;`;
    hud.appendChild(timerEl);

    if (!mobile) {
      const crosshair = document.createElement('div');
      crosshair.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;background:rgba(255,255,255,0.5);border-radius:50%;';
      hud.appendChild(crosshair);
    }

    const msgEl = document.createElement('div');
    msgEl.style.cssText = `position:absolute;top:${mobile ? '40%' : '50%'};left:50%;transform:translate(-50%,-50%);color:#fff;font-size:${mobile ? '20px' : '28px'};text-align:center;text-shadow:0 0 20px #00ff88;width:90%;`;
    hud.appendChild(msgEl);

    const minimap = document.createElement('canvas');
    const mmSize = mobile ? 100 : 150;
    minimap.width = mmSize;
    minimap.height = mmSize;
    minimap.style.cssText = `position:absolute;${mobile ? 'top:50px;right:10px' : 'bottom:20px;right:20px'};width:${mmSize}px;height:${mmSize}px;border:2px solid #3a6b3a;border-radius:8px;opacity:0.8;`;
    hud.appendChild(minimap);
    const mmCtx = minimap.getContext('2d')!;

    function drawMinimap() {
      const s = mmSize / Math.max(MAZE_W, MAZE_H);
      mmCtx.fillStyle = '#0a1a0a';
      mmCtx.fillRect(0, 0, mmSize, mmSize);
      mmCtx.strokeStyle = '#3a6b3a';
      mmCtx.lineWidth = 1;
      for (let y = 0; y < MAZE_H; y++) {
        for (let x = 0; x < MAZE_W; x++) {
          const cell = grid[y][x];
          const bx = x * s;
          const by = y * s;
          if (cell.walls.N) { mmCtx.beginPath(); mmCtx.moveTo(bx, by); mmCtx.lineTo(bx + s, by); mmCtx.stroke(); }
          if (cell.walls.S) { mmCtx.beginPath(); mmCtx.moveTo(bx, by + s); mmCtx.lineTo(bx + s, by + s); mmCtx.stroke(); }
          if (cell.walls.E) { mmCtx.beginPath(); mmCtx.moveTo(bx + s, by); mmCtx.lineTo(bx + s, by + s); mmCtx.stroke(); }
          if (cell.walls.W) { mmCtx.beginPath(); mmCtx.moveTo(bx, by); mmCtx.lineTo(bx, by + s); mmCtx.stroke(); }
        }
      }
      mmCtx.fillStyle = '#00ff88';
      mmCtx.fillRect((MAZE_W - 1) * s + s * 0.3, (MAZE_H - 1) * s + s * 0.3, s * 0.4, s * 0.4);
      const px = (camera.position.x / CELL) * s;
      const py = (camera.position.z / CELL) * s;
      mmCtx.fillStyle = '#ff4444';
      mmCtx.beginPath();
      mmCtx.arc(px, py, 3, 0, Math.PI * 2);
      mmCtx.fill();
      mmCtx.strokeStyle = '#ff4444';
      mmCtx.lineWidth = 2;
      mmCtx.beginPath();
      mmCtx.moveTo(px, py);
      mmCtx.lineTo(px + Math.sin(state.yaw) * -8, py + Math.cos(state.yaw) * -8);
      mmCtx.stroke();

      mmCtx.fillStyle = '#ffd700';
      for (const c of coins) {
        if (!c.collected) {
          const ccx = (c.x / CELL) * s;
          const ccy = (c.z / CELL) * s;
          mmCtx.beginPath();
          mmCtx.arc(ccx, ccy, 2, 0, Math.PI * 2);
          mmCtx.fill();
        }
      }
    }

    // Start message
    if (mobile) {
      msgEl.innerHTML = '<div style="background:rgba(0,0,0,0.7);padding:20px;border-radius:12px;border:1px solid #00ff88">Tap anywhere to start<br><small style="color:#aaa">Left stick: move<br>Swipe right side: look<br>Green button: jump</small></div>';
    } else {
      msgEl.innerHTML = 'Click to start<br><small>WASD to move &bull; SPACE to jump &bull; Mouse to look</small>';
    }

    // ── Game loop ──
    const clock = new THREE.Clock();
    let animId: number;

    function animate() {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (!state.started) {
        renderer.render(scene, camera);
        return;
      }

      // Clear start message once started
      if (msgEl.innerHTML && !state.won) {
        msgEl.innerHTML = '';
      }

      if (!state.won) {
        state.gameTime += dt;
      }

      // ── Movement ──
      const speed = 6;
      const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
      const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
      const move = new THREE.Vector3();

      // Keyboard
      if (state.keys['KeyW'] || state.keys['ArrowUp']) move.add(forward);
      if (state.keys['KeyS'] || state.keys['ArrowDown']) move.sub(forward);
      if (state.keys['KeyD'] || state.keys['ArrowRight']) move.add(right);
      if (state.keys['KeyA'] || state.keys['ArrowLeft']) move.sub(right);

      // Touch joystick
      if (mobile && (Math.abs(state.joystickX) > 0.1 || Math.abs(state.joystickY) > 0.1)) {
        move.add(forward.clone().multiplyScalar(-state.joystickY));
        move.add(right.clone().multiplyScalar(state.joystickX));
      }

      if (move.length() > 0) move.normalize().multiplyScalar(speed * dt);

      const newX = camera.position.x + move.x;
      const newZ = camera.position.z + move.z;

      if (!collidesWall(newX, camera.position.z)) {
        camera.position.x = newX;
      }
      if (!collidesWall(camera.position.x, newZ)) {
        camera.position.z = newZ;
      }

      // ── Gravity & jump ──
      const groundH = getGroundHeight(camera.position.x, camera.position.z);
      const eyeH = groundH + 1.6;

      if (state.keys['Space'] && state.onGround && !state.won) {
        state.velY = 7;
        state.onGround = false;
      }

      state.velY -= 20 * dt;
      state.playerY += state.velY * dt;

      if (state.playerY <= eyeH) {
        state.playerY = eyeH;
        state.velY = 0;
        state.onGround = true;
      }

      camera.position.y = state.playerY;

      // ── Camera rotation ──
      camera.rotation.order = 'YXZ';
      camera.rotation.y = state.yaw;
      camera.rotation.x = state.pitch;

      // ── Coin collection ──
      for (let i = 0; i < coins.length; i++) {
        if (coins[i].collected) continue;
        const dx = camera.position.x - coins[i].x;
        const dz = camera.position.z - coins[i].z;
        if (dx * dx + dz * dz < 1.2) {
          coins[i].collected = true;
          scene.remove(coinMeshes[i]);
          if (coinLights[i]) scene.remove(coinLights[i]);
          state.score++;
        }
      }

      // ── Animate coins ──
      const t = clock.elapsedTime;
      for (let i = 0; i < coins.length; i++) {
        if (coins[i].collected) continue;
        coinMeshes[i].rotation.z = t * 3;
        coinMeshes[i].position.y = 1.2 + Math.sin(t * 2 + i) * 0.15;
      }

      // ── Exit animation ──
      exitRing.rotation.z = t * 0.5;
      exitBeam.material.opacity = 0.5 + Math.sin(t * 3) * 0.2;

      // ── Check win ──
      if (!state.won) {
        const dex = camera.position.x - exitX;
        const dez = camera.position.z - exitZ;
        if (dex * dex + dez * dez < 2) {
          state.won = true;
          if (!mobile) document.exitPointerLock();
          const mins = Math.floor(state.gameTime / 60);
          const secs = Math.floor(state.gameTime % 60);
          msgEl.innerHTML = `
            <div style="background:rgba(0,0,0,0.85);padding:${mobile ? '20px' : '30px 50px'};border-radius:16px;border:2px solid #00ff88">
              <div style="font-size:${mobile ? '32px' : '42px'};margin-bottom:10px">YOU ESCAPED!</div>
              <div style="color:#ffd700;font-size:${mobile ? '18px' : '22px'}">Coins: ${state.score} / ${state.totalCoins}</div>
              <div style="color:#88ff88;font-size:${mobile ? '18px' : '22px'}">Time: ${mins}:${secs.toString().padStart(2, '0')}</div>
              <div style="margin-top:20px;font-size:${mobile ? '14px' : '16px'};color:#aaa">${mobile ? 'Tap EXIT to go back' : 'Click to play again &bull; ESC to exit'}</div>
            </div>`;
        }
      }

      // ── HUD ──
      scoreEl.textContent = `Coins: ${state.score} / ${state.totalCoins}`;
      const mins = Math.floor(state.gameTime / 60);
      const secs = Math.floor(state.gameTime % 60);
      timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

      // Head bob
      if (move.length() > 0 && state.onGround && !state.won) {
        camera.position.y += Math.sin(t * 12) * 0.04;
      }

      drawMinimap();
      renderer.render(scene, camera);
    }

    animate();

    // ── Resize ──
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── ESC to exit (desktop) ──
    const onEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && !document.pointerLockElement) {
        handleExit();
      }
    };
    window.addEventListener('keydown', onEsc);

    // ── Cleanup ──
    function cleanup() {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onEsc);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(hud)) container.removeChild(hud);
      if (joystickOuter && container.contains(joystickOuter)) container.removeChild(joystickOuter);
      if (jumpBtn && container.contains(jumpBtn)) container.removeChild(jumpBtn);
      if (exitBtn && container.contains(exitBtn)) container.removeChild(exitBtn);
    }

    return cleanup;
  }, [handleExit]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: '#000',
        touchAction: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
