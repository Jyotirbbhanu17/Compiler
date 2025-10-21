// ================================
// 🌐 CodeSphere Frontend JS with Judge0
// ================================

// ELEMENTS
const runBtn = document.getElementById("run-btn");
const languageSelect = document.getElementById("language");
const themeToggle = document.getElementById("theme-toggle");
const outputArea = document.getElementById("output");
const loader = document.getElementById("loader");
const runStatus = document.getElementById("run-status");
const autosaveState = document.getElementById("autosave-state");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const historyBox = document.getElementById("history");
const clearHistoryBtn = document.getElementById("clear-history");

let currentTheme = "light";
let history = JSON.parse(localStorage.getItem("runHistory")) || [];
let editor = null;

// Judge0 language IDs
const languageMap = {
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  javascript: 63,
  ruby: 72,
  go: 60,
  php: 68
};

// Default code templates
const codeTemplates = {
  python: "# Write your Python code here\nprint('Hello, CodeSphere!')",
  java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, CodeSphere!\");\n    }\n}",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, CodeSphere!\" << endl;\n    return 0;\n}",
  c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, CodeSphere!\\n\");\n    return 0;\n}",
  javascript: "// Write your JavaScript code here\nconsole.log('Hello, CodeSphere!');",
  ruby: "# Write your Ruby code here\nputs 'Hello, CodeSphere!'",
  go: "package main\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, CodeSphere!\")\n}",
  php: "<?php\necho \"Hello, CodeSphere!\\n\";\n?>"
};

// Monaco Editor setup
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  const savedCode = localStorage.getItem("savedCode");
  const savedLang = localStorage.getItem("savedLanguage") || "python";
  
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: savedCode || codeTemplates[savedLang],
    language: savedLang,
    theme: 'vs-light',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: false,
    padding: { top: 10 }
  });

  // Set language in dropdown
  languageSelect.value = savedLang;

  // Autosave functionality
  editor.onDidChangeModelContent(() => {
    localStorage.setItem("savedCode", editor.getValue());
    autosaveState.textContent = "On ✅";
    setTimeout(() => (autosaveState.textContent = "On"), 1000);
  });

  // Enable buttons after editor loads
  runBtn.disabled = false;
  clearBtn.disabled = false;
  saveBtn.disabled = false;
  
  console.log("Monaco Editor loaded successfully!");
});

// THEME TOGGLE
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  themeToggle.textContent = currentTheme === "dark" ? "Light Mode" : "Dark Mode";
  if(editor) {
    monaco.editor.setTheme(currentTheme === "dark" ? "vs-dark" : "vs-light");
  }
});

// LANGUAGE CHANGE
languageSelect.addEventListener("change", () => {
  const newLang = languageSelect.value;
  if(editor) {
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, newLang);
    localStorage.setItem("savedLanguage", newLang);
  }
});

// CLEAR BUTTON
clearBtn.addEventListener("click", () => { 
  if(editor) {
    const currentLang = languageSelect.value;
    editor.setValue(codeTemplates[currentLang]); 
  }
  outputArea.textContent = "Your output will appear here..."; 
  runStatus.textContent = "";
});

// SAVE BUTTON
saveBtn.addEventListener("click", () => { 
  if(editor) {
    localStorage.setItem("savedCode", editor.getValue());
    localStorage.setItem("savedLanguage", languageSelect.value);
    autosaveState.textContent = "Saved ✅"; 
    setTimeout(() => autosaveState.textContent = "On", 2000); 
  }
});

// CLEAR HISTORY
clearHistoryBtn.addEventListener("click", () => { 
  history = []; 
  localStorage.removeItem("runHistory"); 
  renderHistory(); 
});

// RUN BUTTON (Judge0)
runBtn.addEventListener("click", async () => {
  if(!editor) {
    outputArea.textContent = "⚠️ Editor is still loading. Please wait...";
    return;
  }

  const code = editor.getValue().trim();
  const lang = languageSelect.value;

  if(!code) { 
    outputArea.textContent = "⚠️ Please write some code first!"; 
    runStatus.textContent = "";
    return; 
  }

  // Show loading state
  loader.classList.remove("hidden");
  outputArea.textContent = "Executing code...";
  runStatus.textContent = "Running...";
  runBtn.disabled = true;

  try {
    console.log("Sending request to Judge0...");
    console.log("Language:", lang, "Language ID:", languageMap[lang]);
    
    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "Enter your api key",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageMap[lang],
        stdin: ""
      })
    });

    console.log("Response status:", response.status);

    if(!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response data:", data);
    
    loader.classList.add("hidden");
    runBtn.disabled = false;

    // Show output or errors
    let outputText = "";
    
    if(data.stdout) {
      outputText = data.stdout;
      runStatus.textContent = "✅ Success";
      runStatus.style.color = "#10b981";
    } else if(data.stderr) {
      outputText = "Error:\n" + data.stderr;
      runStatus.textContent = "❌ Runtime Error";
      runStatus.style.color = "#ef4444";
    } else if(data.compile_output) {
      outputText = "Compilation Error:\n" + data.compile_output;
      runStatus.textContent = "❌ Compile Error";
      runStatus.style.color = "#ef4444";
    } else if(data.message) {
      outputText = "Error: " + data.message;
      runStatus.textContent = "❌ Error";
      runStatus.style.color = "#ef4444";
    } else {
      outputText = "No output produced";
      runStatus.textContent = "⚠️ No Output";
      runStatus.style.color = "#f59e0b";
    }

    outputArea.textContent = outputText;

    // Save to history
    const timestamp = new Date().toLocaleString();
    history.unshift({ 
      lang, 
      code: code.substring(0, 100) + (code.length > 100 ? "..." : ""), 
      timestamp, 
      output: outputText.substring(0, 200) + (outputText.length > 200 ? "..." : ""),
      status: data.stdout ? "success" : "error"
    });
    
    // Keep only last 10 items
    if(history.length > 10) {
      history = history.slice(0, 10);
    }
    
    localStorage.setItem("runHistory", JSON.stringify(history));
    renderHistory();

  } catch(err) {
    console.error("Error:", err);
    loader.classList.add("hidden");
    runBtn.disabled = false;
    runStatus.textContent = "❌ Error";
    runStatus.style.color = "#ef4444";
    outputArea.textContent = "Error executing code:\n" + err.message + "\n\nPlease check:\n1. Your internet connection\n2. API key is valid\n3. Code syntax is correct";
  }
});

// RENDER HISTORY
function renderHistory(){
  historyBox.innerHTML = "";
  
  if(history.length === 0){
    historyBox.innerHTML = "<div style='color:#6b7280; font-size:0.9rem; text-align:center; padding:20px;'>No runs yet</div>";
    return; 
  }
  
  history.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("history-item");
    
    const statusIcon = item.status === "success" ? "✅" : "❌";
    const statusColor = item.status === "success" ? "#10b981" : "#ef4444";
    
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="font-weight:600; color: var(--accent);">${statusIcon} ${item.lang.toUpperCase()}</div>
        <div style="font-size:0.75rem; color:#6b7280">${item.timestamp}</div>
      </div>
      <div style="font-size:0.85rem; color:#6b7280; margin-bottom:6px; font-family: var(--mono);">${item.code}</div>
      <div style="font-size:0.8rem; color:${statusColor}; font-family: var(--mono); padding:8px; background:rgba(102,126,234,0.05); border-radius:6px; border-left:3px solid ${statusColor};">${item.output}</div>
    `;
    
    div.style.cursor = "pointer";
    div.onclick = () => {
      if(editor && confirm("Load this code into editor?")) {
        // Get full code from history if available, otherwise use the truncated version
        const fullItem = JSON.parse(localStorage.getItem("runHistory"))[index];
        editor.setValue(fullItem.code);
        languageSelect.value = fullItem.lang;
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, fullItem.lang);
      }
    };
    
    historyBox.appendChild(div);
  });
}

// Initial render
renderHistory();

// Disable buttons until editor loads
runBtn.disabled = true;
clearBtn.disabled = true;
saveBtn.disabled = true;