import { DEFAULT_RESTITUTION } from "./constants.js";

export class CollisionSolver {
  static COR = DEFAULT_RESTITUTION;
  static collisionCount = 0;
  static lastEnergyBefore = 0;
  static lastEnergyAfter = 0;
  static lastEnergyLoss = 0;
  static lastMomentumBefore = 0;
  static lastMomentumAfter = 0;

  static setCOR(value) {
    CollisionSolver.COR = Math.min(Math.max(value, 0), 1);
  }

  static resetCollisionCount() {
    CollisionSolver.collisionCount = 0;
    CollisionSolver.lastEnergyLoss = 0; 
  }

  constructor() {
    this.enabled = true;
  }

  solve(pendulums) {
    if (!this.enabled) return;

    for (let pass = 0; pass < pendulums.length; pass++) {
      for (let i = 0; i < pendulums.length - 1; i++) {
        const a = pendulums[i];
        const b = pendulums[i + 1];

        if (this.isColliding(a, b)) {
          this.resolveVelocity(a, b);
        }
      }
    }

    for (let i = 0; i < pendulums.length - 1; i++) {
      const a = pendulums[i];
      const b = pendulums[i + 1];

      if (this.isColliding(a, b)) {
        this.resolvePosition(a, b);
      }
    }
  }

  isColliding(a, b) {
    const pa = a.getPosition();
    const pb = b.getPosition();
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= a.radius + b.radius;
  }

  resolveVelocity(a, b) {
    const pa = a.getPosition();
    const pb = b.getPosition();
    let nx = pb.x - pa.x;
    let ny = pb.y - pa.y;
    const dist = Math.max(Math.sqrt(nx * nx + ny * ny), 1e-9);
    nx /= dist;
    ny /= dist;

    const tax = Math.cos(a.angle);
    const tay = Math.sin(a.angle);
    const tbx = Math.cos(b.angle);
    const tby = Math.sin(b.angle);

    const va = a.angularVelocity * a.length;
    const vb = b.angularVelocity * b.length;

    const vaN = va * (tax * nx + tay * ny);
    const vbN = vb * (tbx * nx + tby * ny);

    const approach = vaN - vbN;//حساب سرعة الاقتراب بين كرتين
    if (approach <= 0) return;

    CollisionSolver.collisionCount++;

    const m1 = a.mass;
    const m2 = b.mass;
    
    const e = approach > 0.05 ? CollisionSolver.COR : 1.0;

    const energyBefore = a.getKineticEnergy() + b.getKineticEnergy();
    const momentumBefore = a.getMomentumMagnitude() + b.getMomentumMagnitude();

    const newVaN = (vaN * (m1 - e * m2) + (1 + e) * m2 * vbN) / (m1 + m2);
    const newVbN = (vbN * (m2 - e * m1) + (1 + e) * m1 * vaN) / (m1 + m2);

    const deltaVaN = newVaN - vaN;//Δv = v_after − v_before
    const deltaVbN = newVbN - vbN;//Δv = v_after − v_before

    a.angularVelocity += (deltaVaN * (tax * nx + tay * ny)) / a.length;
    b.angularVelocity += (deltaVbN * (tbx * nx + tby * ny)) / b.length;

    const energyAfter = a.getKineticEnergy() + b.getKineticEnergy();
    const momentumAfter = a.getMomentumMagnitude() + b.getMomentumMagnitude();

    CollisionSolver.lastEnergyBefore = energyBefore;
    CollisionSolver.lastEnergyAfter = energyAfter;
    CollisionSolver.lastEnergyLoss += (energyBefore - energyAfter);
    CollisionSolver.lastMomentumBefore = momentumBefore;
    CollisionSolver.lastMomentumAfter = momentumAfter;
  }

  resolvePosition(a, b) {
    const pa = a.getPosition();
    const pb = b.getPosition();
    let nx = pb.x - pa.x;
    let ny = pb.y - pa.y;
    const dist = Math.max(Math.sqrt(nx * nx + ny * ny), 1e-9);
    nx /= dist;
    ny /= dist;

    const tax = Math.cos(a.angle);
    const tay = Math.sin(a.angle);
    const tbx = Math.cos(b.angle);
    const tby = Math.sin(b.angle);

    const overlap = a.radius + b.radius - dist;
    const slop = 0.0001;
    
    if (overlap > slop) {
      const correction = (overlap - slop) * 0.2; 
      const totalInvMass = 1 / a.mass + 1 / b.mass;
      const moveA = (correction * (1 / a.mass)) / totalInvMass;
      const moveB = (correction * (1 / b.mass)) / totalInvMass;

      a.angle -= (moveA * (tax * nx + tay * ny)) / a.length;
      b.angle += (moveB * (tbx * nx + tby * ny)) / b.length;
    }
  }
}