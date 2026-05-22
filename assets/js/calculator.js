const TARIFFS = {
  lifeline: [
    { upto: 50, rate: 3.95 },
    { upto: 100, rate: 7.74 }
  ],
  protected: [
    { upto: 100, rate: 10.54 },
    { upto: 200, rate: 13.01 }
  ],
  nonProtected: [
    { upto: 100, rate: 22.44 },
    { upto: 200, rate: 28.91 },
    { upto: 300, rate: 33.1 },
    { upto: 400, rate: 37.99 },
    { upto: 500, rate: 40.22 },
    { upto: 600, rate: 41.62 },
    { upto: 700, rate: 42.76 },
    { upto: null, rate: 47.69 }
  ],
  touPeak: 24.33,
  touOffPeak: 18.01
};

const CHARGES = {
  gstRate: 0.18,
  taxFilerRate: 0.075,
  taxNonFilerRate: 0.15,
  tvFee: 35,
  njSurchargePerUnit: 0.1,
  financingPerUnit: 0.43,
  fcaPerUnit: -1.55,
  meterRent: 20
};

function formatRs(value) {
  const rounded = Math.round(value);
  return `Rs ${rounded.toLocaleString("en-PK")}`;
}

function getSlabsForType(type, units) {
  if (type === "lifeline") {
    return TARIFFS.lifeline;
  }

  if (type === "protected") {
    if (units > 200) {
      return TARIFFS.nonProtected;
    }
    return TARIFFS.protected;
  }

  return TARIFFS.nonProtected;
}

function calculateSlabs(units, slabs) {
  let remaining = units;
  let total = 0;
  const breakdown = [];
  let lastUpto = 0;

  slabs.forEach((slab) => {
    if (remaining <= 0) return;
    const maxUnits = slab.upto === null ? remaining : slab.upto - lastUpto;
    const usedUnits = Math.min(remaining, maxUnits);
    const cost = usedUnits * slab.rate;
    total += cost;
    breakdown.push({
      range: slab.upto === null ? `${lastUpto + 1}+` : `${lastUpto + 1}-${slab.upto}`,
      units: usedUnits,
      rate: slab.rate,
      cost
    });
    remaining -= usedUnits;
    if (slab.upto !== null) {
      lastUpto = slab.upto;
    }
  });

  return { total, breakdown };
}

function updateChart(total, items) {
  const chart = document.querySelector("[data-chart]");
  if (!chart) return;
  chart.innerHTML = "";

  items.forEach((item) => {
    const wrapper = document.createElement("div");
    const label = document.createElement("div");
    const bar = document.createElement("div");
    const fill = document.createElement("span");

    label.textContent = `${item.label}: ${formatRs(item.value)}`;
    label.className = "chart-label";
    bar.className = "bar";
    fill.style.width = total > 0 ? `${Math.max((item.value / total) * 100, 2)}%` : "0%";

    bar.appendChild(fill);
    wrapper.appendChild(label);
    wrapper.appendChild(bar);
    chart.appendChild(wrapper);
  });
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function toggleRow(selector, show) {
  const el = document.querySelector(selector);
  if (el) {
    el.style.display = show ? "flex" : "none";
  }
}

function calculateBill(event) {
  event.preventDefault();
  const form = event.target;

  const discoInput = form.querySelector("[name='disco']");
  const disco = discoInput ? discoInput.value : form.dataset.disco || "Pakistan";

  const type = form.querySelector("[name='consumer-type']:checked").value;
  const load = form.querySelector("[name='load']").value;
  const filer = form.querySelector("[name='taxpayer']:checked").value;
  const includeFca = form.querySelector("[name='include-fca']").checked;
  const useTou = form.querySelector("[name='use-tou']") ? form.querySelector("[name='use-tou']").checked : false;

  let units, energyCharges, slabResult;

  if (useTou) {
    const peakUnits = Number(form.querySelector("[name='peak-units']")?.value || 0);
    const offPeakUnits = Number(form.querySelector("[name='offpeak-units']")?.value || 0);
    units = peakUnits + offPeakUnits;
    energyCharges = (peakUnits * TARIFFS.touPeak) + (offPeakUnits * TARIFFS.touOffPeak);
    slabResult = {
      total: energyCharges,
      breakdown: [
        { range: "Peak hours", units: peakUnits, rate: TARIFFS.touPeak, cost: peakUnits * TARIFFS.touPeak },
        { range: "Off-peak hours", units: offPeakUnits, rate: TARIFFS.touOffPeak, cost: offPeakUnits * TARIFFS.touOffPeak }
      ]
    };
  } else {
    units = Number(form.querySelector("[name='units']").value || 0);
    const slabs = getSlabsForType(type, units);
    slabResult = calculateSlabs(units, slabs);
    energyCharges = slabResult.total;
  }

  const fixedCharges = load === "lt5" ? 600 : 2000;
  const gst = energyCharges * CHARGES.gstRate;
  const incomeTax = energyCharges * (filer === "filer" ? CHARGES.taxFilerRate : CHARGES.taxNonFilerRate);
  const nj = units * CHARGES.njSurchargePerUnit;
  const financing = units * CHARGES.financingPerUnit;
  const fca = includeFca ? units * CHARGES.fcaPerUnit : 0;
  const tvFee = CHARGES.tvFee;
  const meterRent = CHARGES.meterRent;

  const total = Math.max(energyCharges + fixedCharges + gst + incomeTax + nj + financing + fca + tvFee + meterRent, fixedCharges);

  const resultCard = document.querySelector("#result");
  if (resultCard) resultCard.classList.remove("hidden");
  const afterAd = document.querySelector("[data-ad-after]");
  if (afterAd) afterAd.classList.remove("hidden");

  setText("[data-output='units']", units.toLocaleString("en-PK"));
  setText("[data-output='consumerType']", useTou ? "ToU METER" : type.replace("-", " ").toUpperCase());
  setText("[data-output='disco']", disco);
  setText("[data-output='energyCharges']", formatRs(energyCharges));
  setText("[data-output='fixedCharges']", formatRs(fixedCharges));
  setText("[data-output='gst']", formatRs(gst));
  setText("[data-output='incomeTax']", formatRs(incomeTax));
  setText("[data-output='nj']", formatRs(nj));
  setText("[data-output='financing']", formatRs(financing));
  setText("[data-output='tv']", formatRs(tvFee));
  setText("[data-output='meter']", formatRs(meterRent));
  setText("[data-output='fca']", formatRs(fca));
  setText("[data-output='total']", formatRs(total));

  toggleRow("#line-fca", includeFca);

  const noteEl = document.querySelector("#result-note");
  if (noteEl) {
    let note = "Estimate based on NEPRA 2026 base tariff rates.";
    if (useTou) {
      note += " ToU rates applied for peak and off-peak units.";
    } else if (type === "protected" && units > 200) {
      note += " Units exceed protected limit, so non-protected rates are applied.";
    } else if (type === "lifeline" && units > 100) {
      note += " Lifeline rates cover up to 100 units, extra units use the highest lifeline slab.";
    } else if (type === "commercial") {
      note += " Commercial estimates use non-protected slab rates.";
    }
    noteEl.textContent = note;
  }

  const slabBody = document.querySelector("#slab-table-body");
  if (slabBody) {
    slabBody.innerHTML = "";
    slabResult.breakdown.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.range}</td>
        <td>${row.units}</td>
        <td>${row.rate.toFixed(2)}</td>
        <td>${formatRs(row.cost)}</td>
      `;
      slabBody.appendChild(tr);
    });
  }

  updateChart(total, [
    { label: "Energy", value: energyCharges },
    { label: "Fixed", value: fixedCharges },
    { label: "GST", value: gst },
    { label: "Income Tax", value: incomeTax },
    { label: "Surcharges", value: nj + financing + tvFee + meterRent + Math.max(fca, 0) }
  ]);

  resultCard?.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#bill-form");
  if (!form) return;
  form.addEventListener("submit", calculateBill);

  const loadSelect = form.querySelector("[name='load']");
  const touCheckbox = form.querySelector("[name='use-tou']");
  const touFields = form.querySelector("#tou-fields");
  const standardUnitsField = form.querySelector("#standard-units");

  function toggleTouFields() {
    if (!touFields || !touCheckbox) return;
    const isGte5 = loadSelect?.value === "gte5";
    const isChecked = touCheckbox.checked;
    touFields.style.display = (isGte5 && isChecked) ? "grid" : "none";
    if (standardUnitsField) {
      standardUnitsField.style.display = (isGte5 && isChecked) ? "none" : "block";
    }
  }

  if (loadSelect) loadSelect.addEventListener("change", toggleTouFields);
  if (touCheckbox) touCheckbox.addEventListener("change", toggleTouFields);
  toggleTouFields();
});
