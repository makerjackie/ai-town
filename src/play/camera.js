import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const EYE = 1.62;
const SPEED = 5.2;
const BOUNDS = { minX: -5.4, maxX: 5.4, minZ: -16.8, maxZ: 23.6 };
const FLY = { minX: -22, maxX: 22, minY: 0.45, maxY: 46, minZ: -28, maxZ: 32 };
const HOME = {
  target: new THREE.Vector3(0, 2.2, 0.6),
  phi: Math.PI / 4,
  theta: 0.52,
  radius: 34,
};

export function createPlay(camera, renderer, colliders, clickables, onRheostat) {
  const state = {
    mode: "orbit",
    yaw: 0,
    pitch: -0.06,
    keys: new Set(),
    bob: 0,
    pointerLocked: false,
    flySpeed: 9,
  };

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 3.4, 2);
  controls.minPolarAngle = 0.04;
  controls.maxPolarAngle = Math.PI * 0.92;
  controls.minDistance = 2.4;
  controls.maxDistance = 78;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.enabled = false;

  const cinematic = createCinematicPath();
  let cineT = 0;

  const plaque = document.getElementById("plaque");
  const hint = document.getElementById("hint");

  addEventListener("keydown", (event) => {
    state.keys.add(event.code);
    if (event.code === "KeyC") setMode("cinematic");
    if (event.code === "KeyV") setMode("orbit");
    if (event.code === "KeyF") setMode("fly");
    if (event.code === "KeyG" || event.code === "Escape") setMode("walk");
    if (event.code === "KeyR") onRheostat?.();
    if (event.code === "Space" && state.mode === "fly") event.preventDefault();
  });
  addEventListener("keyup", (event) => state.keys.delete(event.code));

  addEventListener("wheel", (event) => {
    if (state.mode !== "fly") return;
    event.preventDefault();
    const dir = event.deltaY > 0 ? 0.88 : 1.14;
    state.flySpeed = THREE.MathUtils.clamp(state.flySpeed * dir, 2.4, 32);
    paintHint();
  }, { passive: false });

  renderer.domElement.addEventListener("click", () => {
    if (state.mode === "cinematic") {
      setMode("walk");
      renderer.domElement.requestPointerLock?.();
      return;
    }
    if (state.mode === "orbit") {
      pick();
      return;
    }
    if (state.mode === "fly") {
      if (!state.pointerLocked) renderer.domElement.requestPointerLock?.();
      else pick();
      return;
    }
    if (!state.pointerLocked) renderer.domElement.requestPointerLock?.();
    pick();
  });

  document.addEventListener("pointerlockchange", () => {
    state.pointerLocked = document.pointerLockElement === renderer.domElement;
  });

  addEventListener("mousemove", (event) => {
    if (!state.pointerLocked) return;
    if (state.mode !== "walk" && state.mode !== "fly") return;
    state.yaw -= event.movementX * 0.0022;
    state.pitch -= event.movementY * 0.002;
    const limit = state.mode === "fly" ? 1.48 : 1.1;
    state.pitch = THREE.MathUtils.clamp(state.pitch, -limit, limit);
  });

  function syncLookFromCamera() {
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    state.yaw = euler.y;
    state.pitch = THREE.MathUtils.clamp(euler.x, -1.48, 1.48);
  }

  function paintHint() {
    if (state.mode === "cinematic") {
      hint.textContent = "巡游中 · 点击走进夜市 · F 电影镜头 · V 斜俯 · L 切榜 · R 拧变阻器";
    } else if (state.mode === "orbit") {
      hint.textContent = "斜俯 · 拖动旋转 · 滚轮远近 · 右键平移 · C 巡游 · G 落地 · F 飞";
    } else if (state.mode === "fly") {
      hint.textContent = `电影镜头 · WASD 飞 · QE 升降 · Shift 加速 · 滚轮调速 ${state.flySpeed.toFixed(0)} · Esc 落地 · C 巡游 · V 斜俯`;
    } else {
      hint.textContent = "走路 · WASD · 鼠标环顾 · F 电影镜头 · V 斜俯 · C 巡游 · 点击建筑 · L 榜 · R 变阻器";
    }
  }

  function setMode(mode) {
    state.mode = mode;
    controls.enabled = mode === "orbit";
    if (mode === "cinematic") {
      cineT = 0;
    } else if (mode === "orbit") {
      applyHomeView(camera, controls);
    } else if (mode === "fly") {
      syncLookFromCamera();
      if (camera.position.y < 2.8) camera.position.y = 7.2;
      renderer.domElement.requestPointerLock?.();
    } else {
      if (camera.position.y > 5 || Math.abs(camera.position.x) > 7) {
        camera.position.set(0, EYE, 20.4);
        state.yaw = 0;
        state.pitch = -0.04;
      } else {
        camera.position.y = EYE;
        syncLookFromCamera();
      }
    }
    paintHint();
  }

  function pick() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(clickables, true);
    if (!hits.length) {
      plaque.hidden = true;
      plaque.classList.add("hidden");
      return;
    }
    let object = hits[0].object;
    while (object && !object.userData?.clickable) object = object.parent;
    if (!object) return;
    if (object.userData.id === "rheostat") onRheostat?.();
    plaque.hidden = false;
    plaque.classList.remove("hidden");
    plaque.querySelector(".plaque-kicker").textContent = object.userData.kicker ?? "模型镇";
    plaque.querySelector(".plaque-title").textContent = object.userData.title ?? "";
    plaque.querySelector(".plaque-body").textContent = object.userData.body ?? "";
  }

  function collide(next) {
    const r = 0.3;
    next.x = THREE.MathUtils.clamp(next.x, BOUNDS.minX, BOUNDS.maxX);
    next.z = THREE.MathUtils.clamp(next.z, BOUNDS.minZ, BOUNDS.maxZ);
    for (const box of colliders) {
      if (next.x + r > box.minX && next.x - r < box.maxX && next.z + r > box.minZ && next.z + r < box.maxZ) {
        const cx = THREE.MathUtils.clamp(next.x, box.minX, box.maxX);
        const cz = THREE.MathUtils.clamp(next.z, box.minZ, box.maxZ);
        if (Math.abs(next.x - cx) < Math.abs(next.z - cz)) next.z = next.z < box.minZ ? box.minZ - r : box.maxZ + r;
        else next.x = next.x < box.minX ? box.minX - r : box.maxX + r;
      }
    }
    return next;
  }

  function updateWalk(dt) {
    const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    const right = new THREE.Vector3(-Math.cos(state.yaw), 0, Math.sin(state.yaw));
    const move = new THREE.Vector3();
    if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) move.add(forward);
    if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) move.sub(forward);
    if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) move.add(right);
    if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) move.sub(right);
    const walking = move.lengthSq() > 0;
    if (walking) {
      move.normalize().multiplyScalar(SPEED * dt);
      const next = collide(camera.position.clone().add(move));
      camera.position.x = next.x;
      camera.position.z = next.z;
      state.bob += dt * 10;
    }
    camera.position.y = EYE + (walking ? Math.sin(state.bob) * 0.035 : 0);
    camera.rotation.set(state.pitch, state.yaw, 0, "YXZ");
  }

  function updateFly(dt) {
    const cp = Math.cos(state.pitch);
    const forward = new THREE.Vector3(-Math.sin(state.yaw) * cp, -Math.sin(state.pitch), -Math.cos(state.yaw) * cp);
    const right = new THREE.Vector3(-Math.cos(state.yaw), 0, Math.sin(state.yaw));
    const move = new THREE.Vector3();
    if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) move.add(forward);
    if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) move.sub(forward);
    if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) move.add(right);
    if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) move.sub(right);
    if (state.keys.has("KeyE") || state.keys.has("Space")) move.y += 1;
    if (state.keys.has("KeyQ") || state.keys.has("ControlLeft") || state.keys.has("ControlRight")) move.y -= 1;
    if (move.lengthSq() > 0) {
      const boost = state.keys.has("ShiftLeft") || state.keys.has("ShiftRight") ? 2.35 : 1;
      move.normalize().multiplyScalar(state.flySpeed * boost * dt);
      camera.position.add(move);
    }
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, FLY.minX, FLY.maxX);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, FLY.minY, FLY.maxY);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, FLY.minZ, FLY.maxZ);
    camera.rotation.set(state.pitch, state.yaw, 0, "YXZ");
  }

  function updateCinematic(dt) {
    cineT = (cineT + dt * 0.028) % 1;
    const point = cinematic.curve.getPoint(cineT);
    camera.position.copy(point);
    if (cineT < 0.28) {
      const k = cineT / 0.28;
      camera.lookAt(0.22, THREE.MathUtils.lerp(6.8, 13.2, k), THREE.MathUtils.lerp(2.2, -13.4, k));
    } else {
      const look = cinematic.curve.getPoint((cineT + 0.03) % 1);
      camera.lookAt(look.x, look.y - 0.15, look.z);
    }
  }

  function update(dt) {
    if (state.mode === "cinematic") updateCinematic(dt);
    else if (state.mode === "orbit") controls.update();
    else if (state.mode === "fly") updateFly(dt);
    else updateWalk(dt);
  }

  setMode("orbit");
  return { update, setMode, controls, state };
}

function applyHomeView(camera, controls) {
  const { target, phi, theta, radius } = HOME;
  const sinP = Math.sin(phi);
  camera.position.set(
    target.x + radius * sinP * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * sinP * Math.cos(theta),
  );
  controls.target.copy(target);
  controls.update();
}

function createCinematicPath() {
  const points = [
    new THREE.Vector3(0.36, 2.92, 20.2),
    new THREE.Vector3(0.22, 2.95, 16.4),
    new THREE.Vector3(-0.12, 2.9, 13.8),
    new THREE.Vector3(-0.28, 3.05, 7.0),
    new THREE.Vector3(-0.18, 3.4, -1.5),
    new THREE.Vector3(0.12, 6.5, -10.2),
    new THREE.Vector3(3.2, 8.8, -4.8),
    new THREE.Vector3(3.4, 8.1, 8.2),
    new THREE.Vector3(-3.3, 8.2, 8.6),
    new THREE.Vector3(-1.6, 5.6, 19.4),
  ];
  return { curve: new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.12) };
}
