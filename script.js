const steps = {
  goal: {
    kicker: "Step 1",
    title: "Start with the goal",
    copy:
      "The user asks for an outcome. The agent translates that into a working objective, constraints, and a first guess at what evidence it needs.",
    input: "User request, system rules, task context",
    output: "A concrete objective and success criteria",
  },
  context: {
    kicker: "Step 2",
    title: "Gather relevant context",
    copy:
      "The agent reads files, searches references, inspects prior messages, or asks for missing details. The point is to reduce guessing before acting.",
    input: "Workspace state, documents, search results, memory",
    output: "A grounded view of the current situation",
  },
  plan: {
    kicker: "Step 3",
    title: "Choose the next move",
    copy:
      "The model reasons over the goal and context, then picks a step that should move the work forward with a clear expected result.",
    input: "Goal, context, constraints, previous observations",
    output: "A short plan or a single next action",
  },
  tools: {
    kicker: "Step 4",
    title: "Act through tools",
    copy:
      "Tool calls let the agent affect the world: edit a file, run a command, open a browser, query an API, or generate an asset.",
    input: "Selected tool, arguments, permission boundaries",
    output: "A tool result the model can inspect",
  },
  observe: {
    kicker: "Step 5",
    title: "Observe, revise, or stop",
    copy:
      "The agent compares the result to the goal. If something is missing, it loops again. If the result passes, it summarizes what changed.",
    input: "Command output, test result, screenshot, error, user feedback",
    output: "A revision, a new plan, a question, or final delivery",
  },
};

const nodes = document.querySelectorAll(".cycle-node");
const focusKicker = document.querySelector("#focus-kicker");
const focusTitle = document.querySelector("#focus-title");
const focusCopy = document.querySelector("#focus-copy");
const focusInput = document.querySelector("#focus-input");
const focusOutput = document.querySelector("#focus-output");

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
