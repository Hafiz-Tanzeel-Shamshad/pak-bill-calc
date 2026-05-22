function formatRs(value) {
  const rounded = Math.round(value);
  return `Rs ${rounded.toLocaleString("en-PK")}`;
}

function calculateSolar(event) {
  event.preventDefault();
  const form = event.target;

  const units = Number(form.querySelector("[name='solar-units']").value || 0);
  const bill = Number(form.querySelector("[name='solar-bill']").value || 0);
  const roof = Number(form.querySelector("[name='solar-roof']").value || 0);
  let costPerKw = Number(form.querySelector("[name='solar-cost']").value || 180000);
  const hasNetMetering = form.querySelector("[name='solar-nm']")?.checked || false;
  const hasBattery = form.querySelector("[name='solar-battery']")?.checked || false;

  const unitsPerKw = 120;
  const roofPerKw = 100;
  const kwNeeded = units / unitsPerKw;
  const kwPossible = roof / roofPerKw;
  const systemKw = Math.max(0, Math.min(kwNeeded, kwPossible));

  const batteryCostPerKw = 60000;
  const batteryTotal = hasBattery ? systemKw * batteryCostPerKw : 0;
  const systemCost = systemKw * costPerKw + batteryTotal;

  const avgRate = bill / units;
  const solarCoverage = Math.min(1, systemKw * unitsPerKw / units);
  let monthlySaving = bill * solarCoverage * 0.85;
  if (hasNetMetering) monthlySaving *= 1.25;

  const nmBonus = hasNetMetering ? monthlySaving * 0.2 : 0;
  const effectiveMonthlySaving = monthlySaving;
  const annualSaving = effectiveMonthlySaving * 12;

  const paybackYears = annualSaving > 0 ? systemCost / annualSaving : 0;

  const degradationRate = 0.005;
  function totalSavingsOver(years) {
    let total = 0;
    let annual = annualSaving;
    for (let y = 1; y <= years; y++) {
      total += annual;
      annual *= (1 - degradationRate);
    }
    return total;
  }

  const savings10yr = totalSavingsOver(10);
  const savings25yr = totalSavingsOver(25);
  const roiPercent = systemCost > 0 ? ((savings25yr - systemCost) / systemCost) * 100 : 0;
  const co2Saved = units * 12 * 0.82;

  const resultCard = document.querySelector("#solar-result");
  if (resultCard) resultCard.classList.remove("hidden");
  const afterAd = document.querySelector("[data-ad-after]");
  if (afterAd) afterAd.classList.remove("hidden");

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText("[data-output='solar-size']", `${systemKw.toFixed(2)} kW`);
  setText("[data-output='solar-cost']", formatRs(systemCost));
  const costBreakdown = hasBattery ? `(Panels: ${formatRs(systemKw * costPerKw)} + Battery: ${formatRs(batteryTotal)})` : '';
  document.querySelector("[data-output='solar-cost-detail']").textContent = costBreakdown;
  setText("[data-output='solar-savings']", formatRs(effectiveMonthlySaving));
  if (hasNetMetering) {
    setText("[data-output='solar-nm-bonus']", `Includes net metering boost (${formatRs(nmBonus)}/mo extra)`);
  } else {
    setText("[data-output='solar-nm-bonus']", "Enable net metering above for higher savings");
  }
  setText("[data-output='solar-payback']", `${paybackYears.toFixed(1)} years`);
  setText("[data-output='solar-roi']", `${roiPercent.toFixed(0)}%`);
  setText("[data-output='solar-10yr']", formatRs(savings10yr));
  setText("[data-output='solar-25yr']", formatRs(savings25yr));
  setText("[data-output='solar-co2']", `${co2Saved.toFixed(0)} kg`);

  resultCard?.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#solar-form");
  if (!form) return;
  form.addEventListener("submit", calculateSolar);

  const unitsInput = form.querySelector("[name='solar-units']");
  const billInput = form.querySelector("[name='solar-bill']");
  if (unitsInput && billInput) {
    function estimateBill() {
      const u = Number(unitsInput.value);
      if (u > 0 && !billInput.value) {
        billInput.value = Math.round(u * 38);
      }
    }
    unitsInput.addEventListener("blur", estimateBill);
  }
});
