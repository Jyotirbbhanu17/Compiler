document.getElementById("run-btn").addEventListener("click", () => {
  const language = document.getElementById("language").value;
  const code = document.getElementById("code").value.trim();
  const outputArea = document.getElementById("output");

  if (!code) {
    outputArea.textContent = "⚠️ Please write some code first!";
    outputArea.style.opacity = 1;
    return;
  }

  // Simulated output for now
  let simulatedOutput = "";
  if (language === "python") {
    simulatedOutput = "Simulated Python Output:\nHello, World!";
  } else if (language === "java") {
    simulatedOutput = "Simulated Java Output:\nHello, World!";
  } else if (language === "cpp") {
    simulatedOutput = "Simulated C++ Output:\nHello, World!";
  } else {
    simulatedOutput = "Unknown language!";
  }

  // Fancy fade-in effect
  outputArea.style.opacity = 0;
  outputArea.textContent = simulatedOutput;

  let op = 0;
  const fade = setInterval(() => {
    if (op >= 1) clearInterval(fade);
    op += 0.05;
    outputArea.style.opacity = op;
  }, 30);
});
