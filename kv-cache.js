const decodeSteps = [
  {
    label: "Step 1",
    title: "Prefill prompt tokens",
    copy:
      "The model processes prompt tokens in parallel and writes K/V vectors for each layer into cache.",
    tokens: ["System", "User", "Explain", "KV", "cache"],
    activeToken: 4,
    filled: 5,
  },
  {
    label: "Step 2",
    title: "Predict the first output token",
    copy:
      "The final prompt position attends over the cached prompt keys and values, then produces logits for the next token.",
    tokens: ["System", "User", "Explain", "KV", "cache", "KV"],
    activeToken: 5,
    filled: 6,
  },
  {
    label: "Step 3",
    title: "Append new K and V",
    copy:
      "After sampling a token, the runtime computes that token's K and V at every layer and appends them to the cache.",
    tokens: ["System", "User", "Explain", "KV", "cache", "KV", "cache"],
    activeToken: 6,
    filled: 7,
  },
  {
    label: "Step 4",
    title: "Decode with the cache",
    copy:
      "The next token only needs a fresh query for the current position. It attends over all cached K/V entries.",
    tokens: ["System", "User", "Explain", "KV", "cache", "KV", "cache", "stores"],
    activeToken: 7,
    filled: 8,
  },
  {
    label: "Step 5",
    title: "Repeat until stop",
    copy:
      "Generation continues by appending one K/V slice per new token until an end token, length limit, or stop rule fires.",
    tokens: ["System", "User", "Explain", "KV", "cache", "KV", "cache", "stores", "history"],
    activeToken: 8,
    filled: 9,
  },
];

let decodeIndex = 0;

const tokenContainer = document.querySelector("#kv-tokens");
const cacheGrid = document.querySelector("#kv-cache-grid");
const stepLabel = document.querySelector("#kv-step-label");
const stepTitle = document.querySelector("#kv-step-title");
const stepCopy = document.querySelector("#kv-step-copy");
const nextButton = document.querySelector("#kv-next");
const prevButton = document.querySelector("#kv-prev");

function renderDecodeStep() {
  const step = decodeSteps[decodeIndex];

  tokenContainer.innerHTML = "";
  step.tokens.forEach((token, index) => {
    const tokenNode = document.createElement("span");
    tokenNode.textContent = token;
    tokenNode.className = index === step.activeToken ? "active" : "";
    tokenContainer.append(tokenNode);
  });

  cacheGrid.innerHTML = "";
  for (let layer = 1; layer <= 4; layer += 1) {
    const row = document.createElement("div");
    row.className = "cache-row";

    const label = document.createElement("span");
    label.textContent = `L${layer}`;
    row.append(label);

    for (let slot = 0; slot < 9; slot += 1) {
      const cell = document.createElement("i");
      if (slot < step.filled) {
        cell.className = slot === step.activeToken ? "current" : "filled";
      }
      row.append(cell);
    }

    cacheGrid.append(row);
  }

  stepLabel.textContent = step.label;
  stepTitle.textContent = step.title;
  stepCopy.textContent = step.copy;
}

function moveDecode(delta) {
  decodeIndex = (decodeIndex + delta + decodeSteps.length) % decodeSteps.length;
  renderDecodeStep();
}

nextButton.addEventListener("click", () => moveDecode(1));
prevButton.addEventListener("click", () => moveDecode(-1));

const calcFields = {
  layers: document.querySelector("#calc-layers"),
  heads: document.querySelector("#calc-heads"),
  dim: document.querySelector("#calc-dim"),
  seq: document.querySelector("#calc-seq"),
  batch: document.querySelector("#calc-batch"),
  bytes: document.querySelector("#calc-bytes"),
};
const calcResult = document.querySelector("#calc-result");
const calcDetail = document.querySelector("#calc-detail");

function formatBytes(bytes) {
  const units = ["bytes", "KiB", "MiB", "GiB", "TiB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1);
  return `${rounded} ${units[unitIndex]}`;
}

function getNumber(field, fallback) {
  const value = Number.parseInt(field.value, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function updateCacheEstimate() {
  const layers = getNumber(calcFields.layers, 32);
  const heads = getNumber(calcFields.heads, 8);
  const dim = getNumber(calcFields.dim, 128);
  const seq = getNumber(calcFields.seq, 4096);
  const batch = getNumber(calcFields.batch, 1);
  const bytesPerValue = getNumber(calcFields.bytes, 2);
  const bytes = 2 * layers * batch * heads * seq * dim * bytesPerValue;

  calcResult.textContent = formatBytes(bytes);
  calcDetail.textContent = `${bytes.toLocaleString()} bytes of K/V cache`;
}

Object.values(calcFields).forEach((field) => {
  field.addEventListener("input", updateCacheEstimate);
});

renderDecodeStep();
updateCacheEstimate();
