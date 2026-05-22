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

  const unitsPerKw = 120;
  const roofPerKw = 100;
  const kwNeeded = units / unitsPerKw;
  const kwPossible = roof / roofPerKw;
  const systemKw = Math.max(0, Math.min(kwNeeded, kwPossible));

  const costPerKw = 180000;
  const systemCost = systemKw * costPerKw;

  const avgRate = 30;
  const estimatedSaving = Math.min(bill, units * avgRate);
  const paybackYears = systemCost > 0 ? systemCost / (estimatedSaving * 12) : 0;
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
  setText("[data-output='solar-savings']", formatRs(estimatedSaving));
  setText("[data-output='solar-payback']", `${paybackYears.toFixed(1)} years`);
  setText("[data-output='solar-co2']", `${co2Saved.toFixed(0)} kg`);

  resultCard?.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#solar-form");
  if (!form) return;
  form.addEventListener("submit", calculateSolar);
});
