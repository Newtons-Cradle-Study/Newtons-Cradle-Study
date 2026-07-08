import {
  GRAVITY,
  DEFAULT_MASS,
  DEFAULT_RADIUS,
  DEFAULT_LENGTH,
  DEFAULT_DAMPING,
  DEFAULT_DENSITY,
} from "./constants.js";

class PendulumBall {
  constructor(options = {}) {
    // Pivot position
    this.pivotX = options.pivotX ?? 0;
    this.pivotY = options.pivotY ?? 0;

    this.radius = options.radius ?? DEFAULT_RADIUS;
    this.length = options.length ?? DEFAULT_LENGTH;

    this.density = options.density ?? DEFAULT_DENSITY;
    if (options.density && Number.isFinite(options.density)) {
      const volume = (4 / 3) * Math.PI * this.radius ** 3;
      this.mass = options.density * volume;
    } else {
      this.mass = options.mass ?? DEFAULT_MASS;
    }

    this.damping = options.pivotFriction ?? options.damping ?? DEFAULT_DAMPING;
    this.pivotFriction = this.damping;
    this.airDensity = options.airDensity ?? 1.225; // ρ_air kg/m³
    this.dragCoeff = options.dragCoeff ?? 0.47;
    this.enableAirDrag = options.enableAirDrag ?? true;
    this.angle = options.angle ?? 0;
    this.angularVelocity = options.angularVelocity ?? 0;
    this.gravity = options.gravity ?? GRAVITY;
    this.angularAcceleration = 0;
    this._initialAngle = this.angle;
    this._initialAngularVelocity = this.angularVelocity;
  }

  getAirDragCoef() {
    const area = Math.PI * this.radius * this.radius;
    return (
      (0.5 * this.dragCoeff * this.airDensity * area * this.length) / this.mass
    );
  }

  computeAngularAcceleration(state) {
    const gravity = state?.gravity ?? this.gravity ?? GRAVITY;
    const gravityTerm = -(gravity / this.length) * Math.sin(this.angle);
    const pivotTerm = -this.pivotFriction * this.angularVelocity;
    let airTerm = 0;
    if (this.enableAirDrag) {
      const kAir = this.getAirDragCoef();
      airTerm = -kAir * this.angularVelocity * Math.abs(this.angularVelocity);
    }
    this.angularAcceleration = gravityTerm + pivotTerm + airTerm;
    return this.angularAcceleration;
  }

  calculateAcceleration() {
    return this.computeAngularAcceleration();
  }

  applyGravity(state) {
    this.computeAngularAcceleration(state);
  }

  update(state, dt) {
    if (typeof dt !== "number" || dt <= 0) return;

    this.computeAngularAcceleration(state);
    this.angularVelocity += this.angularAcceleration * dt;
    this.angle += this.angularVelocity * dt;
    this.applyConstraints();
  }

  applyConstraints() {
    if (!Number.isFinite(this.angle)) {
      this.angle = 0;
    }
    if (!Number.isFinite(this.angularVelocity)) {
      this.angularVelocity = 0;
    }
    
    if (Math.abs(this.angularVelocity) < 1e-6) {
      this.angularVelocity = 0;
    }
    
    if (this.angle > Math.PI) {
      this.angle = Math.PI;
    } else if (this.angle < -Math.PI) {
      this.angle = -Math.PI;
    }
  }

  getPosition() {
    const x = this.pivotX + this.length * Math.sin(this.angle);
    const y = this.pivotY - this.length * Math.cos(this.angle);
    return { x, y };
  }

  getVelocity() {
    const speed = this.angularVelocity * this.length;
    const velocityAngle = this.angle + Math.PI / 2;
    const vx = speed * Math.cos(velocityAngle);
    const vy = speed * Math.sin(velocityAngle);
    return { x: vx, y: vy };
  }

  getPotentialEnergy() {
    const h = this.length * (1 - Math.cos(this.angle));
    return this.mass * this.gravity * h;
  }

  getKineticEnergy() {
    const v = this.angularVelocity * this.length;
    return 0.5 * this.mass * v * v;
  }

  getTangentialVelocity() {
    return this.angularVelocity * this.length;
  }

  setVelocityFromCartesian(vx, vy) {
    // Get position on the arc
    const px = this.length * Math.sin(this.angle);
    const py = -this.length * Math.cos(this.angle);
    const perpX = Math.cos(this.angle);
    const perpY = Math.sin(this.angle);
    const tangentialComponent = vx * perpX + vy * perpY;
    this.angularVelocity = tangentialComponent / this.length;
  }

  applyImpulse(impulseX, impulseY) {
    const tangentX = Math.cos(this.angle);
    const tangentY = Math.sin(this.angle);
    const tangentialImpulse = impulseX * tangentX + impulseY * tangentY;
    const angularImpulse = tangentialImpulse / (this.mass * this.length);
    this.angularVelocity += angularImpulse;
  }

  getTotalEnergy() {
    return this.getPotentialEnergy() + this.getKineticEnergy();
  }

  reset() {
    this.angle = this._initialAngle;
    this.angularVelocity = this._initialAngularVelocity;
    this.angularAcceleration = 0;
  }

  getMomentum() {
    const v = this.angularVelocity * this.length;
    return this.mass * v;
  }

  getMomentumMagnitude() {
    return Math.abs(this.getMomentum());
  }
}

export default PendulumBall;
