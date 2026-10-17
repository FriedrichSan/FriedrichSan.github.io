import { clamp01 } from "./stage";

/* ------------------------------------------------------------------
   The second entrance: the same family, reached by a quaternion turn of
   the camera with a temporary world-space tilt, so the mother curve is
   never seen almost edge-on. The spread begins in the last third of the
   turn, which keeps the whole entrance one continuous movement.
   Geometry, projection and idle are shared with the settled family.
   ------------------------------------------------------------------ */

export type FamilyPoint = { point: [number, number]; depth: number };
type Quaternion = [number, number, number, number]; // w, x, y, z

export const SLERP_DURATION = 4.4;

const smooth = (x: number) => {
  const p = clamp01(x);
  return p * p * p * (10 + p * (-15 + 6 * p));
};
export const slerpProgress = (age: number) => smooth(age / SLERP_DURATION);
export const slerpSpread = (age: number) => smooth((slerpProgress(age) - 0.7) / 0.3);

function multiply([w, x, y, z]: Quaternion, [v, a, b, c]: Quaternion): Quaternion {
  return [
    w * v - x * a - y * b - z * c,
    w * a + x * v + y * c - z * b,
    w * b - x * c + y * v + z * a,
    w * c + x * b - y * a + z * v,
  ];
}
const qX = (angle: number): Quaternion => [Math.cos(angle / 2), Math.sin(angle / 2), 0, 0];
const qY = (angle: number): Quaternion => [Math.cos(angle / 2), 0, Math.sin(angle / 2), 0];
const qZ = (angle: number): Quaternion => [Math.cos(angle / 2), 0, 0, Math.sin(angle / 2)];

const FINAL_ROTATION = multiply(multiply(qZ(-0.08), qX(1.35)), qY(2.7));
const HALF_ANGLE = Math.acos(FINAL_ROTATION[0]);
const FINAL_ZOOM = 1 / (1 + 0.42 * Math.sin(2.7) ** 2);

function turn(e: number): Quaternion {
  const k = Math.sin(HALF_ANGLE * e) / Math.sin(HALF_ANGLE);
  const base: Quaternion = [
    Math.cos(HALF_ANGLE * e),
    FINAL_ROTATION[1] * k,
    FINAL_ROTATION[2] * k,
    FINAL_ROTATION[3] * k,
  ];
  const b = Math.sin(Math.PI * e);
  return multiply(multiply(qZ(-0.3 * b), qX(0.3 * b)), base);
}

function rotate([w, x, y, z]: Quaternion, v: [number, number, number]): [number, number, number] {
  const result = multiply(multiply([w, x, y, z], [0, ...v]), [w, -x, -y, -z]);
  return [result[1], result[2], result[3]];
}

let frame: { age: number; e: number; limit: number; spread: number; rotation: Quaternion; zoom: number } | undefined;

function entranceFrame(age: number) {
  if (!frame || frame.age !== age) {
    const e = slerpProgress(age);
    frame = {
      age,
      e,
      limit: 1.6 + (1.42 - 1.6) * e,
      spread: slerpSpread(age),
      rotation: turn(e),
      zoom: 1 + (FINAL_ZOOM - 1) * e,
    };
  }
  return frame;
}

function settled(q: number, a: number, idleAge: number): FamilyPoint {
  const u = -1.42 + 2.84 * q;
  const x = 0.72 * (u * u - 1), y = u;
  const z = 0.78 * (u * u * u - u) + 0.38 * a * (u * u - 1);
  const idle = Math.sin(idleAge * 0.38) * 0.016;
  const theta = 2.7 + idle, phi = 1.35 + idle * 0.4;
  const rx = x * Math.cos(theta) + z * Math.sin(theta);
  const rz = -x * Math.sin(theta) + z * Math.cos(theta);
  const ry = y * Math.cos(phi) - rz * Math.sin(phi);
  const depth = y * Math.sin(phi) + rz * Math.cos(phi);
  const roll = -0.08;
  const px = rx * Math.cos(roll) - ry * Math.sin(roll);
  const py = rx * Math.sin(roll) + ry * Math.cos(roll);
  const perspective = 1 / (1 + 0.045 * depth);
  const zoom = 1 / (1 + 0.42 * Math.sin(theta) ** 2);
  return { point: [px * 1.35 * perspective * zoom, py * perspective * zoom], depth };
}

export function sampleFamilySlerp(q: number, parameter: number, age: number, reducedMotion = false): FamilyPoint {
  if (reducedMotion || age >= SLERP_DURATION) return settled(q, parameter, reducedMotion ? 0 : age - SLERP_DURATION);
  const { e, limit, spread, rotation, zoom } = entranceFrame(age);
  const u = -limit + 2 * limit * q;
  const x = (1 + (0.72 - 1) * e) * (u * u - 1);
  const z = 0.78 * (u * u * u - u) + spread * 0.38 * parameter * (u * u - 1);
  const [rx, ry, depth] = rotate(rotation, [x, u, z]);
  const perspective = 1 / (1 + 0.045 * e * depth);
  return { point: [rx * (1 + 0.35 * e) * perspective * zoom, ry * perspective * zoom], depth };
}
