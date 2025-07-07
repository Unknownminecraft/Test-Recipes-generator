// ========== SOUND EFFECT ==========
const clickSound = new Audio("assets/sounds/click.mp3");

// ========== SIDEBAR TOGGLE ==========
const sidebar = document.getElementById("sidebar");
document.getElementById("menuBtn").addEventListener("click", () => {
  clickSound.play();
  sidebar.style.display = "block";
});
document.getElementById("closeSidebar").addEventListener("click", () => {
  clickSound.play();
  sidebar.style.display = "none";
});

// ========== EDITION TOGGLE ==========
const editionRadios = document.querySelectorAll('input[name="edition"]');
const javaWarning = document.getElementById("java-warning");

editionRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    clickSound.play();
    javaWarning.style.display = radio.value === "java" ? "block" : "none";
  });
});

// ========== RECIPE SELECTION ==========
const recipeButtons = document.querySelectorAll(".recipe-btn");
const selectedRecipe = document.getElementById("selectedRecipe");

recipeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    clickSound.play();
    const recipeName = btn.dataset.recipe.replace(/_/g, " ");
    selectedRecipe.textContent = capitalizeWords(recipeName);
  });
});

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ========== TOOLTIP TOGGLE ==========
const tooltips = document.querySelectorAll(".tooltip-btn");
tooltips.forEach((tip) => {
  tip.addEventListener("click", () => {
    clickSound.play();
    const tooltip = tip.nextElementSibling;
    tooltip.style.display = "block";
    setTimeout(() => {
      tooltip.style.display = "none";
    }, 3000);
  });
});

// ========== OUTPUT SLIDER ==========
const outputSlider = document.getElementById("outputAmount");
const outputDisplay = document.getElementById("outputDisplay");
outputSlider.addEventListener("input", () => {
  outputDisplay.textContent = outputSlider.value;
});

// ========== PROCESS BUTTON ==========
document.getElementById("processBtn").addEventListener("click", () => {
  clickSound.play();
  const itemInput = document.getElementById("itemInput").value.trim();
  const itemOutput = document.getElementById("itemOutput").value.trim();
  const count = outputSlider.value;
  const recipe = selectedRecipe.textContent.toLowerCase().replace(/ /g, "_");
  const version = "1.21.50";

  if (!itemInput || !itemOutput) {
    alert("⚠️ Please fill the item names to process");
    return;
  }

  let jsonData = {
    format_version: version,
    [`minecraft:recipe_furnace`]: {
      description: {
        identifier: "deco:" + itemOutput.split(":").pop(),
      },
      tags: [recipe],
      input: itemInput,
      output: {
        [itemOutput]: {
          count: parseInt(count),
        },
      },
    },
  };

  document.getElementById("jsonOutput").textContent = JSON.stringify(
    jsonData,
    null,
    2
  );
});

// ========== COPY & DOWNLOAD ==========
document.getElementById("copyBtn").addEventListener("click", () => {
  clickSound.play();
  const code = document.getElementById("jsonOutput").textContent;
  navigator.clipboard.writeText(code);
  alert("Copied!");
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  clickSound.play();
  const code = document.getElementById("jsonOutput").textContent;
  const output = document.getElementById("itemOutput").value.trim();
  const blob = new Blob([code], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = output ? `${output.split(":").pop()}.json` : "recipe.json";
  a.click();
  URL.revokeObjectURL(url);
});
