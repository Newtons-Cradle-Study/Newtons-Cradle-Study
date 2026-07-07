import { CollisionSolver } from "../physics/CollisionSolver.js";

export class DebugPanel {
  constructor() {
    this.panel = null;
  }

  init() {
    this.panel = document.getElementById("debugPanel");
  }

  computeTotals(pendulums) {
    let totalKE = 0;
    let totalPE = 0;
    let totalMomentum = 0;
    let maxV = -Infinity;
    let minV = Infinity;
    let sumV = 0;

    for (const p of pendulums) {
      const ke = p.getKineticEnergy();
      const pe = p.getPotentialEnergy();
      const v = Math.abs(p.getTangentialVelocity());
      totalKE += ke;
      totalPE += pe;
      totalMomentum += p.getMomentumMagnitude();
      maxV = Math.max(maxV, v);
      minV = Math.min(minV, v);
      sumV += v;
    }

    const avgV = pendulums.length ? sumV / pendulums.length : 0;
    const totalEnergy = totalKE + totalPE;

    return {
      totalKE,
      totalPE,
      totalEnergy,
      totalMomentum,
      maxV: isFinite(maxV) ? maxV : 0,
      minV: isFinite(minV) ? minV : 0,
      avgV,
    };
  }

  update(pendulums, options = {}) {
    if (!this.panel) return;
    if (!pendulums || pendulums.length === 0) return;

    const totals = this.computeTotals(pendulums);
    const showEnergy = options.showEnergyAnalysis !== false;
    const showMomentum = options.showMomentumAnalysis !== false;
    const showBallDetails = options.showBallDetails !== false;

    const initialEnergy =
      options.initialEnergy && options.initialEnergy > 0
        ? options.initialEnergy
        : 0;

    const collisions = CollisionSolver.collisionCount ?? 0;
    const beforeE = CollisionSolver.lastEnergyBefore ?? 0;
    const afterE = CollisionSolver.lastEnergyAfter ?? 0;
    const loss = CollisionSolver.lastEnergyLoss ?? 0;
    const beforeP = CollisionSolver.lastMomentumBefore ?? 0;
    const afterP = CollisionSolver.lastMomentumAfter ?? 0;

    let perBallHtml = "";
    if (showBallDetails) {
      for (const p of pendulums) {
        const pos = p.getPosition();
        const vel = p.getVelocity();
        perBallHtml += `<div style="margin-bottom:6px"><b>كرة ${p.id}</b>: θ=${p.angle.toFixed(4)} | ω=${p.angularVelocity.toFixed(4)}<br/>v=${p.getTangentialVelocity().toFixed(4)} م/ث<br/>x=${pos.x.toFixed(3)} | y=${pos.y.toFixed(3)}</div>`;
      }
    }

    const energyLossPct =
      initialEnergy > 0
        ? ((initialEnergy - totals.totalEnergy) / initialEnergy) * 100
        : 0;
    const clampedLossPct = Math.max(0, Math.min(100, energyLossPct));
    const conservationError =
      beforeE > 0 ? ((beforeE - afterE) / beforeE) * 100 : 0;

    const energySection = showEnergy
      ? `<hr/><div><b>تحليل الطاقة</b></div>
         <div>الابتدائية: ${initialEnergy.toFixed(4)} J | الحالية: ${totals.totalEnergy.toFixed(4)} J</div>
         <div>الفقد: ${(initialEnergy - totals.totalEnergy).toFixed(4)} J | النسبة: ${clampedLossPct.toFixed(2)}%</div>`
      : "";

    const momentumSection = showMomentum
      ? `<hr/><div><b>تحليل الزخم</b></div>
         <div>الزخم الكلي: ${totals.totalMomentum.toFixed(4)} كغ·م/ث</div>`
      : "";

    this.panel.innerHTML = `
      <div><b>التحليل الفيزيائي</b></div>
      <div>التصادمات: ${collisions}</div>
      <hr/>
      <div><b>النظام</b></div>
      <div>حركية: ${totals.totalKE.toFixed(4)} J | وضعية: ${totals.totalPE.toFixed(4)} J</div>
      <div>الكلية: ${totals.totalEnergy.toFixed(4)} J</div>
      <div>سرعة متوسطة: ${totals.avgV.toFixed(4)} م/ث</div>
      ${energySection}
      ${momentumSection}
      ${perBallHtml ? `<hr/><div><b>الكرات</b></div>${perBallHtml}` : ""}
    `;
  }

  reset() {}
}

export default DebugPanel;
