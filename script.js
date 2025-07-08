document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bedrockBtn = document.getElementById('bedrock-btn');
    const javaBtn = document.getElementById('java-btn');
    const javaWarning = document.getElementById('java-warning');
    const recipeTypeHeading = document.getElementById('recipe-type-heading');
    const recipeOptionsContainer = document.querySelector('.recipe-options');
    const advancedSettingsToggle = document.getElementById('advanced-settings-toggle');
    const advancedSettingsBox = document.getElementById('advanced-settings-box');
    const inputItem = document.getElementById('input-item');
    const outputItem = document.getElementById('output-item');
    const outputAmount = document.getElementById('output-amount');
    const outputAmountValue = document.getElementById('output-amount-value');
    const processBtn = document.getElementById('process-btn');
    const jsonOutput = document.getElementById('json-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Audio Elements
    const clickSound = new Audio('assets/sounds/click.mp3');
    const processSound = new Audio('assets/sounds/process.mp3');
    const downloadSound = new Audio('assets/sounds/download.mp3');
    const errorSound = new Audio('assets/sounds/error.mp3');

    let selectedRecipe = 'furnace';

    const recipeTypes = [
        { id: 'furnace', name: 'Furnace', icon: 'furnace_icon.png' },
        { id: 'blast_furnace', name: 'Blast Furnace', icon: 'blast_furnace_icon.png' },
        { id: 'campfire', name: 'Campfire', icon: 'campfire_icon.png' },
        { id: 'smoker', name: 'Smoker', icon: 'smoker_icon.png' },
        { id: 'stonecutter', name: 'Stonecutter', icon: 'stonecutter_icon.png' },
        { id: 'smithing_table', name: 'Smithing Table', icon: 'smithing_table_icon.png' },
        { id: 'crafting_table', name: 'Crafting Table (beta)', icon: 'crafting_table_icon.png' },
        { id: 'brewing_stand', name: 'Brewing Stand (beta)', icon: 'brewing_stand_icon.png' },
    ];

    // --- Event Listeners ---

    // Edition Selection
    bedrockBtn.addEventListener('click', () => {
        clickSound.play();
        bedrockBtn.classList.add('selected');
        javaBtn.classList.remove('selected');
        javaWarning.style.display = 'none';
    });

    javaBtn.addEventListener('click', () => {
        clickSound.play();
        javaBtn.classList.add('selected');
        bedrockBtn.classList.remove('selected');
        javaWarning.style.display = 'block';
    });

    // Recipe Type Selection
    recipeTypes.forEach(recipe => {
        const option = document.createElement('div');
        option.classList.add('recipe-option');
        if (recipe.id === 'furnace') option.classList.add('selected');
        option.dataset.recipe = recipe.id;
        option.innerHTML = `<img src="assets/images/${recipe.icon}" alt="${recipe.name}"><p>${recipe.name}</p>`;
        option.addEventListener('click', () => {
            clickSound.play();
            document.querySelectorAll('.recipe-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedRecipe = recipe.id;
            recipeTypeHeading.textContent = `Recipe for ${recipe.name.replace(' (beta)', '')}`;
        });
        recipeOptionsContainer.appendChild(option);
    });

    // Advanced Settings
    advancedSettingsToggle.addEventListener('click', () => {
        clickSound.play();
        advancedSettingsBox.style.display = advancedSettingsBox.style.display === 'none' ? 'block' : 'none';
    });

    // Output Amount Slider
    outputAmount.addEventListener('input', () => {
        outputAmountValue.textContent = outputAmount.value;
    });

    // Process Button
    processBtn.addEventListener('click', () => {
        processSound.play();
        if (!inputItem.value || !outputItem.value) {
            errorSound.play();
            alert('⚠️ Please fill the item names to process');
            return;
        }
        generateJson();
    });

    // Copy and Download Buttons
    copyBtn.addEventListener('click', () => {
        clickSound.play();
        navigator.clipboard.writeText(jsonOutput.textContent);
    });

    downloadBtn.addEventListener('click', () => {
        downloadSound.play();
        const blob = new Blob([jsonOutput.textContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${outputItem.value.split(':').pop() || 'recipe'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // --- JSON Generation ---
    function generateJson() {
        let json;
        const version = document.getElementById('version-select').value;
        const identifier = `deco:${outputItem.value.split(':').pop()}`;
        const count = parseInt(outputAmount.value);

        switch (selectedRecipe) {
            case 'furnace':
            case 'blast_furnace':
            case 'campfire':
            case 'smoker':
                json = {
                    "format_version": version,
                    "minecraft:recipe_furnace": {
                        "description": { "identifier": identifier },
                        "tags": [selectedRecipe],
                        "input": inputItem.value,
                        "output": { [outputItem.value]: { "count": count } }
                    }
                };
                break;
            // Add other cases for different recipe types
        }

        jsonOutput.textContent = JSON.stringify(json, null, 2);
    }
});
