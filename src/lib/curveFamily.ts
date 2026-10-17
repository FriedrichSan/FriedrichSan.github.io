import { clamp01, easeInOutCubic } from "./stage";

export type FamilyPoint = { point: [number, number]; depth: number };
export const FAMILY_DURATION = 3.2;

// A single polynomial parametrisation, viewed from a moving camera. Every
// frame contains the complete curve: there are no joins or growing tips.
// The family is a visual interpretation of the reference, not a model of
// the particular flat family in Hartshorne's figure.
export function sampleFamily(q: number, parameter: number, age: number, reducedMotion = false): FamilyPoint {
  const progress = easeInOutCubic(clamp01(age / FAMILY_DURATION));
  const a = parameter;
  const u = -1.42 + 2.84 * q;
  const x = 0.72 * (u * u - 1);
  const y = u;
  const z = 0.78 * (u * u * u - u) + 0.38 * a * (u * u - 1);
  const idle = reducedMotion ? 0 : Math.sin(Math.max(0, age - FAMILY_DURATION) * 0.38) * 0.016;
  // Tilt before the orbit becomes edge-on, avoiding the camera directions
  // parallel to a tangent. The family lives in depth from the first frame.
  const theta = 2.7 * progress + idle;
  const phi = 1.35 * (1 - (1 - progress) ** 5) + idle * 0.4;
  const rx = x * Math.cos(theta) + z * Math.sin(theta);
  const rz = -x * Math.sin(theta) + z * Math.cos(theta);
  const ry = y * Math.cos(phi) - rz * Math.sin(phi);
  const depth = y * Math.sin(phi) + rz * Math.cos(phi);
  const roll = -0.08 * progress;
  const px = rx * Math.cos(roll) - ry * Math.sin(roll);
  const py = rx * Math.sin(roll) + ry * Math.cos(roll);
  const perspective = 1 / (1 + 0.045 * progress * depth);
  const zoom = 1 / (1 + 0.42 * Math.sin(theta) ** 2);
  return { point: [px * 1.35 * perspective * zoom, py * perspective * zoom], depth };
}
