import PendulumBall from "./PendulumBall.js";
import PendulumSystem from "./PendulumSystem.js";
import Config from "../core/Config.js";

export class CradleFactory {
  static createCradle(options = {}) {
    const count = options.count ?? Config.cradle?.count ?? 5;
    const radius = options.radius ?? Config.cradle?.radius ?? 0.32;
    const length = options.length ?? Config.cradle?.length ?? 3.6;
    const pivotY = options.pivotY ?? Config.cradle?.pivotY ?? 4.8;

    const spacing = radius * 2;
    const totalWidth = spacing * (count - 1);
    const startX = -totalWidth / 2;

    const system = new PendulumSystem();

    for (let i = 0; i < count; i++) {
      const pivotX = startX + i * spacing;

      const ball = new PendulumBall({
        pivotX,
        pivotY,
        length,
        radius,
        density: options.density ?? Config.cradle?.density,
        mass: options.mass ?? Config.cradle?.mass ?? 1,
        damping:
          options.damping ?? Config.cradle?.damping ?? 0.02,
        airDensity: options.airDensity ?? Config.cradle?.airDensity ?? 1.225,
        dragCoeff: options.dragCoeff ?? Config.cradle?.dragCoeff ?? 0.47,
        enableAirDrag: options.enableAirDrag ?? Config.cradle?.enableAirDrag ?? true,
        angle: 0,
        angularVelocity: 0,
      });

      system.addPendulum(ball);
    }

    return system;
  }
}

export default CradleFactory;