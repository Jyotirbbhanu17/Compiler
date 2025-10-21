document.getElementById("run-btn").addEventListener("click", () => {
  const language = document.getElementById("language").value;
  const code = document.getElementById("code").value.trim();
  const outputArea = document.getElementById("output");

  if (!code) {
    outputArea.textContent = "⚠️ Please write some code first!";
    return;
  }

  // For now, simulate output
  if (language === "python") {
    outputArea.textContent = "Simulated Python Output:\nHello, World!";
  } else if (language === "java") {
    outputArea.textContent = "Simulated Java Output:\nHello, World!";
  } else if (language === "cpp") {
    outputArea.textContent = "Simulated C++ Output:\nHello, World!";
  } else {
    outputArea.textContent = "Unknown language!";
  }
});
