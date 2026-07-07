class Integrator {
  static euler(ball, dt) {
    ball.calculateAcceleration();

    ball.angle += ball.angularVelocity * dt;

    ball.angularVelocity += ball.angularAcceleration * dt;
  }

  static semiImplicitEuler(ball, dt) {
    ball.calculateAcceleration();

    ball.angularVelocity += ball.angularAcceleration * dt;

    ball.angle += ball.angularVelocity * dt;
  }
}

export default Integrator;