import * as CollisionSolverModule from "./CollisionSolver.js";

class PendulumSystem {
  constructor() {
    this.pendulums = [];
    this.collisionSolver = new CollisionSolverModule.CollisionSolver();
    this.fixedDt = 1 / 240;
    this._accumulator = 0;
    this._maxAccumulator = 0.25;
  }

  addPendulum(pendulum) {
    const index = this.pendulums.length;
    pendulum.id = index;
    this.pendulums.push(pendulum);
    return index;
  }

  removePendulum(indexOrPendulum) {
    if (typeof indexOrPendulum === "number") {
      if (indexOrPendulum >= 0 && indexOrPendulum < this.pendulums.length) {
        this.pendulums.splice(indexOrPendulum, 1);
        return true;
      }
    } else {
      const index = this.pendulums.indexOf(indexOrPendulum);
      if (index !== -1) {
        this.pendulums.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  update(dt) {
    this._accumulator += Math.min(
      Math.max(typeof dt === "number" ? dt : 0, 0),
      this._maxAccumulator,
    );

    while (this._accumulator >= this.fixedDt) {
      this._step(this.fixedDt);
      this._accumulator -= this.fixedDt;
    }
  }

  _step(dt) {
    for (let i = 0; i < this.pendulums.length; i++) {
      const pendulum = this.pendulums[i];
      if (typeof pendulum.update === "function") {
        pendulum.update(null, dt);
      }
    }

    this.collisionSolver.solve(this.pendulums);
  }

  reset() {
    for (let i = 0; i < this.pendulums.length; i++) {
      this.pendulums[i].reset();
    }
  }

  get count() {
    return this.pendulums.length;
  }

  getPendulum(index) {
    return this.pendulums[index] || null;
  }

  getAllPendulums() {
    return [...this.pendulums];
  }

  clear() {
    this.pendulums = [];
  }
}

export default PendulumSystem;
