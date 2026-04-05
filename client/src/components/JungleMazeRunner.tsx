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
      // ~30% chance of a ground obstacle in a corridor
      if (Math.random() < 0.3) {
        const cx = x * CELL + CELL / 2;
        const cz = y * CELL + CELL / 2;
        obstacles.push({ x: cx, z: cz, width: 1.5, height: 0.6 });
      }
    }
  }
  // remove obstacle at spawn
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
  });

  const handleExit = useCallback(() => onExit(), [onExit]);

  useEffect(() => {
    const container = containerRef.current!;
    const state = stateRef.current;

    // ── Renderer & scene ──
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
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
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Dappled light effect
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
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0x0d3d0d, side: THREE.DoubleSide });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
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

        // Random vines on walls
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

    // Exit particle ring
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

    // Coin glow lights
    const coinLights: THREE.PointLight[] = [];
    for (const c of coins) {
      const light = new THREE.PointLight(0xffd700, 0.3, 4);
      light.position.set(c.x, 1.5, c.z);
      scene.add(light);
      coinLights.push(light);
    }

    // ── Obstacles (logs/roots to jump over) ──
    const obstacles = placeObstacles(grid);
    const obstacleMeshes: THREE.Mesh[] = [];
    for (const o of obstacles) {
      const geo = new THREE.BoxGeometry(o.width, o.height, o.width);
      const m = new THREE.Mesh(geo, obstacleMat);
      m.position.set(o.x, o.height / 2, o.z);
      m.castShadow = true;
      scene.add(m);
      obstacleMeshes.push(m);
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
            // outer boundary
            if (px - PLAYER_R < 0 || px + PLAYER_R > MAZE_W * CELL ||
                pz - PLAYER_R < 0 || pz + PLAYER_R > MAZE_H * CELL) return true;
            continue;
          }
          const cell = grid[cz][cx];
          const wx = cx * CELL + CELL / 2;
          const wz = cz * CELL + CELL / 2;

          // N wall
          if (cell.walls.N) {
            const wallZ = wz - CELL / 2;
            if (px + PLAYER_R > wx - CELL / 2 && px - PLAYER_R < wx + CELL / 2 &&
                pz + PLAYER_R > wallZ - WALL_HALF && pz - PLAYER_R < wallZ + WALL_HALF) return true;
          }
          // S wall
          if (cell.walls.S) {
            const wallZ = wz + CELL / 2;
            if (px + PLAYER_R > wx - CELL / 2 && px - PLAYER_R < wx + CELL / 2 &&
                pz + PLAYER_R > wallZ - WALL_HALF && pz - PLAYER_R < wallZ + WALL_HALF) return true;
          }
          // E wall
          if (cell.walls.E) {
            const wallX = wx + CELL / 2;
            if (pz + PLAYER_R > wz - CELL / 2 && pz - PLAYER_R < wz + CELL / 2 &&
                px + PLAYER_R > wallX - WALL_HALF && px - PLAYER_R < wallX + WALL_HALF) return true;
          }
          // W wall
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

    // ── Input ──
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
      if (!state.started) {
        state.started = true;
      }
      renderer.domElement.requestPointerLock();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // ── HUD ──
    const hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;top:0;left:0;width:100%;pointer-events:none;z-index:10;font-family:monospace;';
    container.appendChild(hud);

    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = 'position:absolute;top:20px;left:20px;color:#ffd700;font-size:24px;text-shadow:0 0 10px #ffa500;';
    hud.appendChild(scoreEl);

    const timerEl = document.createElement('div');
    timerEl.style.cssText = 'position:absolute;top:20px;right:20px;color:#88ff88;font-size:24px;text-shadow:0 0 10px #44ff44;';
    hud.appendChild(timerEl);

    const crosshair = document.createElement('div');
    crosshair.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;background:rgba(255,255,255,0.5);border-radius:50%;';
    hud.appendChild(crosshair);

    const msgEl = document.createElement('div');
    msgEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:28px;text-align:center;text-shadow:0 0 20px #00ff88;';
    hud.appendChild(msgEl);

    const minimap = document.createElement('canvas');
    minimap.width = 150;
    minimap.height = 150;
    minimap.style.cssText = 'position:absolute;bottom:20px;right:20px;border:2px solid #3a6b3a;border-radius:8px;opacity:0.8;';
    hud.appendChild(minimap);
    const mmCtx = minimap.getContext('2d')!;

    function drawMinimap() {
      const s = 150 / Math.max(MAZE_W, MAZE_H);
      mmCtx.fillStyle = '#0a1a0a';
      mmCtx.fillRect(0, 0, 150, 150);
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
      // Exit
      mmCtx.fillStyle = '#00ff88';
      mmCtx.fillRect((MAZE_W - 1) * s + s * 0.3, (MAZE_H - 1) * s + s * 0.3, s * 0.4, s * 0.4);
      // Player
      const px = (camera.position.x / CELL) * s;
      const py = (camera.position.z / CELL) * s;
      mmCtx.fillStyle = '#ff4444';
      mmCtx.beginPath();
      mmCtx.arc(px, py, 3, 0, Math.PI * 2);
      mmCtx.fill();
      // Direction
      mmCtx.strokeStyle = '#ff4444';
      mmCtx.lineWidth = 2;
      mmCtx.beginPath();
      mmCtx.moveTo(px, py);
      mmCtx.lineTo(px + Math.sin(state.yaw) * -8, py + Math.cos(state.yaw) * -8);
      mmCtx.stroke();

      // Uncollected coins
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
    msgEl.innerHTML = 'Click to start<br><small>WASD to move &bull; SPACE to jump &bull; Mouse to look</small>';

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

      if (!state.won) {
        state.gameTime += dt;
      }

      // ── Movement ──
      const speed = 6;
      const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
      const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
      const move = new THREE.Vector3();

      if (state.keys['KeyW'] || state.keys['ArrowUp']) move.add(forward);
      if (state.keys['KeyS'] || state.keys['ArrowDown']) move.sub(forward);
      if (state.keys['KeyD'] || state.keys['ArrowRight']) move.add(right);
      if (state.keys['KeyA'] || state.keys['ArrowLeft']) move.sub(right);
      if (move.length() > 0) move.normalize().multiplyScalar(speed * dt);

      // Try X then Z independently for wall sliding
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

      if ((state.keys['Space']) && state.onGround && !state.won) {
        state.velY = 7;
        state.onGround = false;
      }

      state.velY -= 20 * dt; // gravity
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
          scene.remove(coinLights[i]);
          state.score++;
        }
      }

      // ── Animate remaining coins ──
      const t = clock.elapsedTime;
      for (let i = 0; i < coins.length; i++) {
        if (coins[i].collected) continue;
        coinMeshes[i].rotation.z = t * 3;
        coinMeshes[i].position.y = 1.2 + Math.sin(t * 2 + i) * 0.15;
      }

      // ── Exit ring animation ──
      exitRing.rotation.z = t * 0.5;
      exitBeam.material.opacity = 0.5 + Math.sin(t * 3) * 0.2;

      // ── Check win ──
      if (!state.won) {
        const dex = camera.position.x - exitX;
        const dez = camera.position.z - exitZ;
        if (dex * dex + dez * dez < 2) {
          state.won = true;
          document.exitPointerLock();
          const mins = Math.floor(state.gameTime / 60);
          const secs = Math.floor(state.gameTime % 60);
          msgEl.innerHTML = `
            <div style="background:rgba(0,0,0,0.7);padding:30px 50px;border-radius:16px;border:2px solid #00ff88">
              <div style="font-size:42px;margin-bottom:10px">YOU ESCAPED!</div>
              <div style="color:#ffd700;font-size:22px">Coins: ${state.score} / ${state.totalCoins}</div>
              <div style="color:#88ff88;font-size:22px">Time: ${mins}:${secs.toString().padStart(2, '0')}</div>
              <div style="margin-top:20px;font-size:16px;color:#aaa">Click to play again &bull; ESC to exit</div>
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

    // ── ESC to exit ──
    const onEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && !document.pointerLockElement) {
        handleExit();
      }
    };
    window.addEventListener('keydown', onEsc);

    // ── Win click to replay ──
    const onWinClick = () => {
      if (state.won) {
        // Reset everything
        cleanup();
      }
    };
    renderer.domElement.addEventListener('dblclick', onWinClick);

    // ── Cleanup ──
    function cleanup() {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onEsc);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('dblclick', onWinClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(hud)) container.removeChild(hud);
    }

    return cleanup;
  }, [handleExit]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#000' }}
    />
  );
}
