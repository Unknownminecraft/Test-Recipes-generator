// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- INITIALIZE HEADER ---
	// This assumes the finisher-header.es.js library is loaded correctly in the HTML
    try {
        new FinisherHeader({
            "count": 46,
            "size": { "min": 1, "max": 62, "pulse": 0.1 },
            "speed": { "x": { "min": 0, "max": 0.7 }, "y": { "min": 0, "max": 0.7 }},
            "colors": { "background": "#15182e", "particles": ["#ff926b", "#87ddfe", "#acaaff", "#1bffc2", "#f9a5fe"]},
            "blending": "none",
            "opacity": { "center": 0.6, "edge": 0.9 },
            "skew": 0.1,
            "shapes": ["c", "s", "t"]
        });
    } catch (e) {
        console.error("FinisherHeader library not found or failed to initialize.", e);
        document.getElementById('finisher-header').style.display = 'none'; // Hide header if it fails
    }

    // --- DOM ELEMENTS ---
    const bedrockBtn = document.getElementById('bedrock-btn');
    const javaBtn = document.getElementById('java-btn');
    const javaWarning = document.getElementById('java-warning');
    const recipeTypeSelector = document.getElementById('recipe-type-selector');
    const recipeNameDisplay = document.getElementById('recipe-name-display');
    const mainUiContainer = document.getElementById('main-ui-container');
    const outputItemInput = document.getElementById('output-item-input');
    const outputCountSlider = document.getElementById('output-count-slider');
    const sliderValue = document.getElementById('slider-value');
    const processBtn = document.getElementById('process-btn');
    const jsonOutputSection = document.getElementById('json-output-section');
    const jsonOutputEl = document.getElementById('json-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const versionInput = document.getElementById('version-input');
    const toggleAdvancedBtn = document.getElementById('toggle-advanced').parentElement; // Target the header div
    const advancedSettingsBox = document.getElementById('advanced-settings-box');
    const outputAmountSection = document.getElementById('output-amount-section');
    const rememberToggle = document.getElementById('remember-toggle');
    const outputSection = document.getElementById('output-section');

    // --- STATE & DATA ---
    let currentRecipeType = 'furnace';
    let advancedSettings = {}; // To store values if "Remember" is on

    const recipeTypes = {
        furnace: { name: 'Furnace', icon: 'https://i.ibb.co/b5cGJ9kK/Lit-Furnace-S-BE2.png', tag: 'furnace'},
        blast_furnace: { name: 'Blast Furnace', icon: 'https://i.ibb.co/XkvBQtZH/Blast-Furnace-S-BE1.png', tag: 'blast_furnace'},
        campfire: { name: 'Campfire', icon: 'https://i.ibb.co/5gMnf1qw/Soul-Campfire-JE1-BE1.gif', tag: 'campfire'},
        smoker: { name: 'Smoker', icon: 'https://i.ibb.co/WWJSPfX5/Smoker-S-JE2.png', tag: 'smoker'},
        stonecutter: { name: 'Stonecutter', icon: 'https://i.ibb.co/LX97sJWB/Stonecutter.gif', tag: 'stonecutter'},
        smithing_table: { name: 'Smithing Table', icon: 'https://i.ibb.co/tTNGRgsD/Smithing-Table.png', tag: 'smithing_table'},
        crafting_table: { name: 'Crafting Table (beta)', icon: 'https://i.ibb.co/PZTxf4jk/Crafting-Table-JE3-BE2.png', tag: 'crafting_table'},
        brewing_stand: { name: 'Brewing Stand (beta)', icon: 'https://i.ibb.co/JWMLfZHs/Brewing-Stand-Full-JE6-BE2.png', tag: 'brewing_stand'},
    };

    // --- SOUNDS ---
    const sounds = {
        click: new Audio('assets/sounds/click.mp3'),
        process: new Audio('assets/sounds/process.mp3'),
        download: new Audio('assets/sounds/download.mp3'),
        error: new Audio('assets/sounds/error.mp3'),
    };
    
    function playSound(sound) {
        sounds[sound]?.play().catch(e => console.log(`Could not play sound: ${sound}.mp3`));
    }
    
    // --- LOCAL STORAGE & STATE MANAGEMENT ---
    function saveAdvancedSettings() {
        if (!rememberToggle.checked) return;
        const settings = {};
        const inputs = advancedSettingsBox.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                settings[input.id] = input.checked;
            } else {
                settings[input.id] = input.value;
            }
        });
        advancedSettings[currentRecipeType] = settings;
    }

    function loadAdvancedSettings() {
        if (!rememberToggle.checked || !advancedSettings[currentRecipeType]) return;
        const settings = advancedSettings[currentRecipeType];
        Object.keys(settings).forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = settings[id];
                } else {
                    input.value = settings[id];
                }
            }
        });
    }

    // --- UI INITIALIZATION ---
    function initializeUI() {
        // Populate recipe type buttons
        Object.keys(recipeTypes).forEach(key => {
            const recipe = recipeTypes[key];
            const btn = document.createElement('button');
            btn.className = 'btn icon-btn';
            btn.dataset.type = key;
            btn.innerHTML = `<img src="${recipe.icon}" alt="${recipe.name}"><span>${recipe.name}</span>`;
            if (key === currentRecipeType) btn.classList.add('active');
            recipeTypeSelector.appendChild(btn);
        });
        
        updateUIForRecipeType();
    }
    
    // --- DYNAMIC UI UPDATES ---
    function updateUIForRecipeType() {
        // Save settings before switching
        saveAdvancedSettings();
        
        // Hide all optional sections first
        outputSection.classList.remove('hidden');
        outputAmountSection.classList.remove('hidden');

        // Reset main container and advanced settings
        mainUiContainer.innerHTML = '';
        advancedSettingsBox.innerHTML = '';
        
        recipeNameDisplay.textContent = recipeTypes[currentRecipeType].name;
        
        // Build the appropriate UI based on the selected recipe type
        const uiBuilder = window[`build_${currentRecipeType}_ui`];
        const advancedUiBuilder = window[`build_${currentRecipeType}_advanced_ui`];
        
        if (uiBuilder) uiBuilder();
        if (advancedUiBuilder) advancedUiBuilder();
        
        // Load settings after building UI
        loadAdvancedSettings();
        
        // Update active button styling
        document.querySelectorAll('#recipe-type-selector .btn').forEach(b => {
            b.classList.toggle('active', b.dataset.type === currentRecipeType);
        });
    }

    // --- UI BUILDER FUNCTIONS (Global Scope for simplicity) ---

    window.createInput = (id, label, tooltip, placeholder, required = true, type = 'text') => {
        return `
            <section class="ui-section">
                <div class="input-group">
                    <label for="${id}">${required ? '*' : ''} ${label} <span class="tooltip">?<span class="tooltiptext">${tooltip}</span></span></label>
                    <input type="${type}" id="${id}" class="text-input" placeholder="${placeholder}">
                </div>
            </section>
        `;
    };
    
    window.createIdentifierInput = (defaultValue, readOnly = false) => {
        return `
            <div class="input-group">
                <label for="identifier-input">Identifier Name</label>
                <div style="display: flex; align-items: center;">
                    <span id="identifier-prefix" style="margin-right: 5px;"></span>
                    <input type="text" id="identifier-input" class="text-input" value="${defaultValue}" ${readOnly ? 'readonly' : ''}>
                </div>
            </div>
        `;
    };

    window.build_furnace_ui = window.build_blast_furnace_ui = window.build_campfire_ui = window.build_smoker_ui = () => {
        mainUiContainer.innerHTML = createInput('input-item', 'Item Name (Input) 📝', 'Type the input item name, e.g., minecraft:chicken', 'e.g., minecraft:iron_ore');
    };

    window.build_stonecutter_ui = () => {
        mainUiContainer.innerHTML = createInput('input-item', 'Item Name (Input) 📝', 'Type the input item name, e.g., minecraft:stone', 'e.g., minecraft:oak_log');
    };

    window.build_smithing_table_ui = () => {
        mainUiContainer.innerHTML = 
            createInput('base-item', 'Base Item Name 📝', 'Enter an armor or tool name, e.g., minecraft:diamond_sword', 'e.g., minecraft:netherite_chestplate') +
            createInput('addition-item', 'Addition Item Name 📝', 'Enter an ore/material name, e.g., minecraft:netherite_ingot', 'e.g., minecraft:amethyst_shard');
        outputAmountSection.classList.add('hidden');
    };
    
    window.build_crafting_table_ui = () => {
         mainUiContainer.innerHTML = `
            <section class="ui-section">
                <h3 id="crafting-pattern-title">Crafting Pattern</h3>
                <div id="crafting-grid" class="crafting-grid">
                    ${Array(9).fill(0).map((_, i) => `<input type="text" maxlength="1" class="grid-slot" data-index="${i}">`).join('')}
                </div>
                <h3 id="key-mapping-title">Key Mappings</h3>
                <div id="key-mapping-container">
                    </div>
            </section>
        `;
        setupCraftingGridListeners();
    };
    
    window.build_brewing_stand_ui = () => {
        mainUiContainer.innerHTML = `
            <section class="ui-section">
                <div class="input-group">
                    <label for="potion-input">* Potion Type</label>
                    <input type="text" id="potion-input" class="text-input" list="potion-list" placeholder="e.g., minecraft:potion_type:water">
                    <datalist id="potion-list">
                       <option value="minecraft:potion_type:water"></option><option value="minecraft:potion_type:awkward"></option><option value="minecraft:potion_type:thick"></option>
                    </datalist>
                </div>
            </section>
            <section class="ui-section">
                <div class="input-group">
                    <label for="reagent-input">* Reagent Name</label>
                    <input type="text" id="reagent-input" class="text-input" list="reagent-list" placeholder="e.g., minecraft:nether_wart">
                     <datalist id="reagent-list">
                       <option value="minecraft:nether_wart"></option><option value="minecraft:glowstone_dust"></option><option value="minecraft:redstone"></option>
                    </datalist>
                </div>
            </section>
        `;
        outputSection.innerHTML = createInput('output-item-input', '* Output Potion Type', 'Type the output potion, e.g. minecraft:potion_type:long_swiftness', 'e.g., minecraft:potion_type:healing');
        outputSection.classList.remove('hidden');
        outputAmountSection.classList.add('hidden');
    };
    
    // --- ADVANCED UI BUILDERS ---
    
    window.build_furnace_advanced_ui = window.build_blast_furnace_advanced_ui = window.build_campfire_advanced_ui = window.build_smoker_advanced_ui = () => {
        advancedSettingsBox.innerHTML = createIdentifierInput('deco:output_name') + `
            <div class="input-group">
                <label>Can Use In:</label>
                <div class="btn-group">
                    <input type="checkbox" id="use-furnace" value="furnace"><label for="use-furnace">Furnace</label>
                    <input type="checkbox" id="use-campfire" value="campfire"><label for="use-campfire">Campfire</label>
                    <input type="checkbox" id="use-smoker" value="smoker"><label for="use-smoker">Smoker</label>
                    <input type="checkbox" id="use-blast-furnace" value="blast_furnace"><label for="use-blast-furnace">Blast Furnace</label>
                </div>
            </div>
        `;
    };

    window.build_stonecutter_advanced_ui = () => {
        advancedSettingsBox.innerHTML = createIdentifierInput('minecraft:stonecutter_output_name') + createInput('priority-input', 'Priority', 'Optional numeric value, e.g. 1', '', false, 'number');
    };
    
    window.build_smithing_table_advanced_ui = () => {
        advancedSettingsBox.innerHTML = createIdentifierInput('minecraft:smithing_output_name');
    };
    
    window.build_crafting_table_advanced_ui = () => {
        advancedSettingsBox.innerHTML = createIdentifierInput('deco:output_name') + `
            <div class="input-group">
                 <label for="recipe-type-select">Recipe Type <span class="tooltip">?<span class="tooltiptext">Shaped requires a pattern, Shapeless does not.</span></span></label>
                 <select id="recipe-type-select" class="text-input">
                    <option value="minecraft:recipe_shaped" selected>Shaped</option>
                    <option value="minecraft:recipe_shapeless">Shapeless</option>
                 </select>
            </div>
            ${createInput('priority-input', 'Priority', 'Optional numeric value, e.g. 1', '', false, 'number')}
        `;
    };
    
    window.build_brewing_stand_advanced_ui = () => {
         advancedSettingsBox.innerHTML = createIdentifierInput('', true); // Read-only
         document.getElementById('identifier-prefix').textContent = "minecraft:brew_";
    };

    // --- CRAFTING GRID LOGIC ---
    function setupCraftingGridListeners() {
        const keyMappingContainer = document.getElementById('key-mapping-container');
        const gridSlots = document.querySelectorAll('.grid-slot');
        let usedKeys = new Set();

        const updateKeys = () => {
            const currentKeys = new Set(Array.from(gridSlots).map(s => s.value.trim().toUpperCase()).filter(v => v !== ''));
            
            // Remove mappings for keys no longer in the grid
            usedKeys.forEach(key => {
                if (!currentKeys.has(key)) {
                    document.getElementById(`key-map-${key}`)?.remove();
                }
            });

            // Add mappings for new keys
            currentKeys.forEach(key => {
                if (!usedKeys.has(key)) {
                     const keyItem = document.createElement('div');
                     keyItem.className = 'key-item';
                     keyItem.id = `key-map-${key}`;
                     keyItem.innerHTML = `
                        <span class="key-item-symbol">${key}:</span>
                        <input type="text" class="text-input key-item-input" data-key="${key}" placeholder="minecraft:item_name">
                        <button class="delete-key-btn" data-key-to-delete="${key}">x</button>
                     `;
                     keyMappingContainer.appendChild(keyItem);
                     keyItem.querySelector('.delete-key-btn').addEventListener('click', (e) => {
                         const keyToDelete = e.target.dataset.keyToDelete;
                         gridSlots.forEach(slot => { if(slot.value.toUpperCase() === keyToDelete) slot.value = ''; });
                         updateKeys();
                     });
                }
            });
            usedKeys = currentKeys;
        };
        
        gridSlots.forEach(slot => {
            slot.addEventListener('input', updateKeys);
            slot.addEventListener('keyup', (e) => e.target.value = e.target.value.toUpperCase());
        });
    }

    // --- JSON GENERATION ---
    function generateJson() {
        try {
            let jsonString;
            const outputName = outputItemInput.value.trim();
            const version = versionInput.value.trim();

            const generator = window[`generate_${currentRecipeType}_json`];
            if(generator) {
                jsonString = generator(version, outputName);
            } else {
                throw new Error(`Generator for ${currentRecipeType} not found.`);
            }

            playSound('process');
            displayJson(jsonString);
        } catch (error) {
            playSound('error');
            alert(`⚠️ Error: ${error.message}`);
        }
    }
    
    window.generate_furnace_json = window.generate_blast_furnace_json = window.generate_campfire_json = window.generate_smoker_json = (version, outputName) => {
        const inputItem = document.getElementById('input-item').value.trim();
        if (!inputItem || !outputName) throw new Error("Please fill all required item names (*).");
        
        let identifier = document.getElementById('identifier-input').value.trim() || `deco:${outputName.split(':').pop() || 'output_name'}`;
        
        let tags = Array.from(document.querySelectorAll('#advanced-settings-box input[type="checkbox"]:checked')).map(cb => `"${cb.value}"`);
        if(tags.some(t => t.includes('campfire'))) tags.push('"soul_campfire"');
        
        const finalTags = [...new Set(tags)]; // Remove duplicates
        if (finalTags.length === 0) finalTags.push(`"${recipeTypes[currentRecipeType].tag}"`);

        return JSON.stringify({
          "format_version": version,
          "minecraft:recipe_furnace": {
            "description": { "identifier": identifier },
            "tags": JSON.parse(`[${finalTags.join(',')}]`),
            "input": inputItem,
            "output": {
              "item": outputName,
              "count": parseInt(outputCountSlider.value)
            }
          }
        }, null, 2);
    };

    window.generate_smithing_table_json = (version, outputName) => {
        const base = document.getElementById('base-item').value.trim();
        const addition = document.getElementById('addition-item').value.trim();
        if (!base || !addition || !outputName) throw new Error("Please fill all required item names (*).");
        let identifier = document.getElementById('identifier-input').value.trim() || `minecraft:smithing_${outputName.split(':').pop() || 'output_name'}`;

        return JSON.stringify({
            "format_version": version,
            "minecraft:recipe_smithing_transform": {
              "description": { "identifier": identifier },
              "tags": [ "smithing_table" ],
              "base": base,
              "addition": addition,
              "result": outputName
            }
        }, null, 2);
    };

    window.generate_brewing_stand_json = (version) => {
        const potionInput = document.getElementById('potion-input').value.trim();
        const reagentInput = document.getElementById('reagent-input').value.trim();
        const outputName = document.getElementById('output-item-input').value.trim(); // It's repurposed
        if (!potionInput || !reagentInput || !outputName) throw new Error("Please fill all required fields (*).");

        const identifier = `minecraft:brew_${potionInput.split(':').pop()}_${outputName.split(':').pop()}`;
        document.getElementById('identifier-input').value = identifier;
        
        return JSON.stringify({
            "format_version": version,
            "minecraft:recipe_brewing_mix": {
              "description": { "identifier": identifier },
              "tags": [ "brewing_stand" ],
              "input": potionInput,
              "reagent": reagentInput,
              "output": outputName
            }
        }, null, 2);
    };
    
    // ... other generator functions for stonecutter, crafting, etc.

    function displayJson(jsonString) {
        const highlighted = jsonString
            .replace(/"(format_version|description|tags|output|result|ingredients|key|pattern|input|reagent|base|addition|priority|item|count|identifier)"/g, '<span style="color: #69F0AE;">"$1"</span>')
            .replace(/"(minecraft|deco|[\w_]+)(?=:)/g, '<span style="color: #FF5252;">"$1"</span>')
            .replace(/: ("[^"]*")/g, ': <span style="color: #4FC3F7;">$1</span>')
            .replace(/([\{\}\[\]\,])/g, '<span style="color: #FFFFFF;">$1</span>')
            .replace(/(\d+)/g, '<span style="color: #FFFFFF;">$1</span>');
             
        jsonOutputEl.innerHTML = highlighted;
        jsonOutputSection.classList.remove('hidden');
    }

    // --- EVENT LISTENERS ---
    bedrockBtn.addEventListener('click', () => {
        playSound('click');
        bedrockBtn.classList.add('active');
        javaBtn.classList.remove('active');
        javaWarning.classList.add('hidden');
    });

    javaBtn.addEventListener('click', () => {
        playSound('click');
        javaBtn.classList.add('active');
        bedrockBtn.classList.remove('active');
        javaWarning.classList.remove('hidden');
    });

    recipeTypeSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (btn && btn.dataset.type && btn.dataset.type !== currentRecipeType) {
            playSound('click');
            currentRecipeType = btn.dataset.type;
            updateUIForRecipeType();
        }
    });
    
    toggleAdvancedBtn.addEventListener('click', () => {
        playSound('click');
        advancedSettingsBox.classList.toggle('hidden');
    });

    outputCountSlider.addEventListener('input', () => {
        sliderValue.textContent = outputCountSlider.value;
    });
    
    rememberToggle.addEventListener('change', () => {
        if (!rememberToggle.checked) {
            advancedSettings = {}; // Clear saved settings if toggled off
        }
    });

    processBtn.addEventListener('click', generateJson);

    copyBtn.addEventListener('click', () => {
        playSound('click');
        navigator.clipboard.writeText(JSON.stringify(JSON.parse(jsonOutputEl.textContent), null, 2)).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy', 2000);
        });
    });

    downloadBtn.addEventListener('click', () => {
        const filename = (outputItemInput.value.split(':').pop() || 'recipe') + '.json';
        const blob = new Blob([JSON.stringify(JSON.parse(jsonOutputEl.textContent), null, 2)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        playSound('download');
    });

    // Initial setup
    initializeUI();
});
