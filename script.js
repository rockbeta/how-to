const steps = {
  goal: {
    kicker: "Step 1",
    title: "Assemble the message context",
    copy:
      "The runtime builds the model input from instructions, the user request, file excerpts, tool schemas, and recent observations.",
    input: "System messages, developer rules, user prompt, retrieved context",
    output: "A token sequence the LLM can condition on",
  },
  context: {
    kicker: "Step 2",
    title: "Track working state",
    copy:
      "The agent keeps a compact state outside the model call: open questions, files inspected, constraints, and the current best next action.",
    input: "Conversation, previous observations, task memory",
    output: "A short decision record and updated state",
  },
  plan: {
    kicker: "Step 3",
    title: "Select a typed action",
    copy:
      "The model chooses whether to answer, inspect, edit, test, browse, ask a question, or stop. Tool actions are emitted as structured calls.",
    input: "Goal, context, schemas, sandbox limits",
    output: "A tool call, patch proposal, question, or final response",
  },
  tools: {
    kicker: "Step 4",
    title: "Execute outside the model",
    copy:
      "The runtime validates the request, runs the command or file edit, captures output, and records enough evidence for the next turn.",
    input: "Tool name, arguments, working directory, permission class",
    output: "Exit code, stdout, stderr, file diff, screenshot, or artifact",
  },
  observe: {
    kicker: "Step 5",
    title: "Observe, patch, verify, repeat",
    copy:
      "The observation is fed back into context. The model may generate a code patch, request another tool call, run verification, or deliver.",
    input: "Observation packet plus current objective",
    output: "Revised code, validation step, or final summary",
  },
};

const packets = {
  prompt: {
    kicker: "Packet 01",
    title: "Prompt packet",
    badge: "messages",
    copy:
      "The runtime assembles the visible context the model can condition on: instructions, the user request, relevant files, and available tool schemas.",
    code: `{
  "messages": [
    {
      "role": "system",
      "content": "You are a coding agent. Prefer small verified edits."
    },
    {
      "role": "developer",
      "content": "Use apply_patch for manual edits. Verify in browser."
    },
    {
      "role": "user",
      "content": "Add a technical intro showing prompt -> thinking -> tools -> code."
    }
  ],
  "context": {
    "cwd": "/repo/how-to",
    "open_files": ["index.html", "styles.css", "script.js"],
    "tool_schemas": ["exec_command", "apply_patch", "browser"]
  }
}`,
  },
  thinking: {
    kicker: "Packet 02",
    title: "Reasoning state",
    badge: "state",
    copy:
      "The model may use hidden internal reasoning. What the runtime needs is a compact decision record: objective, uncertainty, and next action.",
    code: `{
  "objective": "Make the explainer more technical",
  "known_state": [
    "Static site with existing hero and loop sections",
    "User wants data exchanged between agent parts",
    "Need one interactive sample packet viewer"
  ],
  "next_action": {
    "kind": "inspect_files",
    "reason_summary": "Find the current HTML, CSS, and JS boundaries before editing"
  },
  "stop_condition": "Page explains loop and verifies without layout errors"
}`,
  },
  tool: {
    kicker: "Packet 03",
    title: "Tool call",
    badge: "call",
    copy:
      "A tool call is not prose. It is a typed request with arguments that the runtime can validate, execute, and log.",
    code: `{
  "tool": "exec_command",
  "arguments": {
    "cmd": "sed -n '1,260p' index.html",
    "cwd": "/repo/how-to",
    "max_output_tokens": 12000
  },
  "permission_class": "read",
  "expected_observation": "Current section structure and element IDs"
}`,
  },
  observation: {
    kicker: "Packet 04",
    title: "Observation packet",
    badge: "result",
    copy:
      "The tool result comes back as evidence. The next model call receives the relevant output, not a vague statement that the command ran.",
    code: `{
  "tool": "exec_command",
  "exit_code": 0,
  "stdout_excerpt": [
    "<section class=\\"hero\\">...",
    "<section class=\\"intro-band\\">...",
    "<section class=\\"section\\" id=\\"cycle\\">..."
  ],
  "stderr": "",
  "inference": "Add a new technical section after intro-band and wire JS to it"
}`,
  },
  code: {
    kicker: "Packet 05",
    title: "Code-generation patch",
    badge: "diff",
    copy:
      "For a coding agent, generation usually lands as a patch. The runtime applies it deterministically and can show the resulting diff.",
    code: `*** Begin Patch
*** Update File: index.html
@@
+<section class="technical-section" id="pipeline">
+  <button class="flow-step" data-packet="tool">
+    <strong>Tool usage</strong>
+    <small>A structured request to inspect the repo</small>
+  </button>
+  <pre><code id="packet-code"></code></pre>
+</section>
*** Update File: script.js
@@
+flowButtons.forEach((button) => {
+  button.addEventListener("click", () => setPacket(button.dataset.packet));
+});
*** End Patch`,
  },
  verify: {
    kicker: "Packet 06",
    title: "Verification result",
    badge: "checks",
    copy:
      "Verification is another observation. Passing checks let the agent stop; failing checks become the next loop input.",
    code: `{
  "checks": [
    {
      "name": "browser interaction",
      "status": "passed",
      "evidence": "Clicking Tool usage updates the packet panel"
    },
    {
      "name": "layout",
      "status": "passed",
      "evidence": "No horizontal overflow at tested viewport"
    },
    {
      "name": "console",
      "status": "passed",
      "evidence": "0 error logs"
    }
  ],
  "next_action": "finalize_and_summarize"
}`,
  },
};

const nodes = document.querySelectorAll(".cycle-node");
const focusKicker = document.querySelector("#focus-kicker");
const focusTitle = document.querySelector("#focus-title");
const focusCopy = document.querySelector("#focus-copy");
const focusInput = document.querySelector("#focus-input");
const focusOutput = document.querySelector("#focus-output");
const flowButtons = document.querySelectorAll(".flow-step");
const packetKicker = document.querySelector("#packet-kicker");
const packetTitle = document.querySelector("#packet-title");
const packetBadge = document.querySelector("#packet-badge");
const packetCopy = document.querySelector("#packet-copy");
const packetCode = document.querySelector("#packet-code");

function setStep(stepName) {
  const step = steps[stepName];

  if (!step) return;

  nodes.forEach((node) => {
    node.classList.toggle("active", node.dataset.step === stepName);
  });

  focusKicker.textContent = step.kicker;
  focusTitle.textContent = step.title;
  focusCopy.textContent = step.copy;
  focusInput.textContent = step.input;
  focusOutput.textContent = step.output;
}

nodes.forEach((node) => {
  node.addEventListener("click", () => setStep(node.dataset.step));
});

function setPacket(packetName) {
  const packet = packets[packetName];

  if (!packet) return;

  flowButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.packet === packetName);
  });

  packetKicker.textContent = packet.kicker;
  packetTitle.textContent = packet.title;
  packetBadge.textContent = packet.badge;
  packetCopy.textContent = packet.copy;
  packetCode.textContent = packet.code;
}

flowButtons.forEach((button) => {
  button.addEventListener("click", () => setPacket(button.dataset.packet));
});

setPacket("prompt");
