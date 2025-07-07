document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT REFERENCES ---
    const bedrockBtn = document.getElementById('bedrock-btn');
    const javaBtn = document.getElementById('java-btn');
    const javaWarning = document.getElementById('java-warning');
    const recipeTypeSelector = document.getElementById('recipe-type-selector');
    const recipeNameDisplay = document.getElementById('recipe-name-display');
    const versionInput = document.getElementById('version-input');
    const toggleAdvancedBtn = document.getElementById('toggle-advanced');
    const rememberToggle = document.getElementById('remember-toggle');
    const advancedSettingsBox = document.getElementById('advanced-settings-box');
    const mainUiContainer = document.getElementById('main-ui-container');
    const outputSection = document.getElementById('output-section');
    const outputItemInput = document.getElementById('output-item-input');
    const outputAmountSection = document.getElementById('output-amount-section');
    const outputCountSlider = document.getElementById('output-count-slider');
    const sliderValueDisplay = document.getElementById('slider-value-display');
    const processBtn = document.getElementById('process-btn');
    const jsonOutputSection = document.getElementById('json-output-section');
    const jsonOutputEl = document.getElementById('json-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    // --- STATE & DATA ---
    let currentRecipeType = 'furnace';
    let advancedSettings = {}; // For the 'remember' feature

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
    const playSound = (sound) => sounds[sound]?.play().catch(e => console.error(`Could not play sound: ${sound}.mp3`));
    
    // --- STATE MANAGEMENT ---
    const saveAdvancedSettings = () => {
        if (!rememberToggle.checked) return;
        const settings = {};
        advancedSettingsBox.querySelectorAll('input, select').forEach(input => {
            settings[input.id] = input.type === 'checkbox' ? input.checked : input.value;
        });
        advancedSettings[currentRecipeType] = settings;
    };

    const loadAdvancedSettings = () => {
        if (!rememberToggle.checked || !advancedSettings[currentRecipeType]) return;
        const settings = advancedSettings[currentRecipeType];
        Object.keys(settings).forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (input.type === 'checkbox') input.checked = settings[id];
                else input.value = settings[id];
            }
        });
    };

    // --- UI BUILDER FUNCTIONS ---
    const createInputGroup = (id, label, tooltip, placeholder, required = true, type = 'text') => `
        <div class="input-group">
            <label for="${id}">${required ? '*' : ''} ${label} <span class="tooltip">?<span class="tooltiptext">${tooltip}</span></span></label>
            <input type="${type}" id="${id}" class="text-input" placeholder="${placeholder}">
        </div>`;

    const buildFurnaceUI = () => {
        mainUiContainer.innerHTML = `<section class="ui-section">${createInputGroup('input-item', 'Item Name (Input) 📝', 'Type the input item name, e.g. minecraft:raw_iron', 'e.g. minecraft:raw_iron')}</section>`;
        advancedSettingsBox.innerHTML = `
            ${createInputGroup('identifier', 'Identifier Name', 'The unique name for this recipe, e.g. my_pack:cooked_porkchop', false)}
            <div class="input-group">
                <label>Can Use In:</label>
                <div class="btn-group">
                    ${['furnace', 'blast_furnace', 'smoker', 'campfire'].map(tag => `
                        <label><input type="checkbox" id="use-${tag}" value="${tag}"> ${tag.replace('_', ' ')}</label>
                    `).join('')}
                </div>
            </div>`;
    };
    
    // ... Other UI builders would go here for each recipe type.
    // For brevity, I'll focus on the core logic, you can expand this pattern.

    // --- JSON GENERATION ---
    const generateJson = () => {
        try {
            let recipeJson;
            const format_version = versionInput.value.trim();
            const identifier = (document.getElementById('identifier')?.value.trim() || `deco:${outputItemInput.value.split(':')[1] || 'output_name'}`);

            if(!identifier.includes(':')) {
                throw new Error('Identifier must contain a ":" (e.g., mypack:myitem)');
            }

            // Simple furnace example
            const inputItem = document.getElementById('input-item')?.value.trim();
            const outputItem = outputItemInput.value.trim();

            if (!inputItem || !outputItem) {
                throw new Error("Please fill all required (*) item name fields.");
            }
            
            let tags = Array.from(document.querySelectorAll('#advanced-settings-box input[type="checkbox"]:checked')).map(cb => cb.value);
            if (tags.includes('campfire')) tags.push('soul_campfire');
            if (tags.length === 0) tags.push(recipeTypes[currentRecipeType].tag);

            recipeJson = {
                "format_version": format_version,
                "minecraft:recipe_furnace": {
                    "description": { "identifier": identifier },
                    "tags": [...new Set(tags)], // Remove duplicates
                    "input": inputItem,
                    "output": {
                        "item": outputItem,
                        "count": parseInt(outputCountSlider.value, 10)
                    }
                }
            };
            
            displayJson(recipeJson);
            playSound('process');
        } catch (error) {
            alert(`⚠️ ${error.message}`);
            playSound('error');
        }
    };

    const displayJson = (jsonObj) => {
        const jsonString = JSON.stringify(jsonObj, null, 2);
        const highlighted = jsonString
            .replace(/"(format_version|description|tags|output|result|ingredients|key|pattern|input|reagent|base|addition|priority|item|count|identifier)"/g, '<span class="json-key">"$1"</span>')
            .replace(/"([\w_]+)(?=:)/g, '<span class="json-namespace">"$1"</span>')
            .replace(/: ("[^"]*")/g, ': <span class="json-string">$1</span>')
            .replace(/([\{\}\[\]\,])/g, '<span class="json-punctuation">$1</span>')
            .replace(/(\s\d+)/g, '<span class="json-number">$1</span>');
        
        jsonOutputEl.innerHTML = highlighted;
        jsonOutputSection.classList.remove('hidden');
    };

    // --- CORE UI UPDATE LOGIC ---
    const updateUI = () => {
        saveAdvancedSettings();
        
        // Hide all dynamic sections initially
        [outputSection, outputAmountSection, mainUiContainer].forEach(el => el.classList.remove('hidden'));
        advancedSettingsBox.innerHTML = '';
        mainUiContainer.innerHTML = '';

        recipeNameDisplay.textContent = recipeTypes[currentRecipeType].name;
        
        // This is a simplified example. A full implementation would use a switch or object mapping.
        buildFurnaceUI(); // For now, only furnace UI is defined
        
        loadAdvancedSettings();

        document.querySelectorAll('#recipe-type-selector .btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === currentRecipeType);
        });
    };

    // --- INITIALIZATION ---
    const init = () => {
        // Create recipe type buttons
        Object.keys(recipeTypes).forEach(key => {
            const recipe = recipeTypes[key];
            const btn = document.createElement('button');
            btn.className = 'btn icon-btn';
            btn.dataset.type = key;
            btn.innerHTML = `<img src="${recipe.icon}" alt="${recipe.name}"><span>${recipe.name}</span>`;
            recipeTypeSelector.appendChild(btn);
        });

        // Add event listeners
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
                updateUI();
            }
        });

        toggleAdvancedBtn.addEventListener('click', () => {
            playSound('click');
            advancedSettingsBox.classList.toggle('hidden');
        });
        
        outputCountSlider.addEventListener('input', () => {
            sliderValueDisplay.textContent = outputCountSlider.value;
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
            try {
                const filename = (outputItemInput.value.split(':')[1] || 'recipe') + '.json';
                const blob = new Blob([JSON.stringify(JSON.parse(jsonOutputEl.textContent), null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                playSound('download');
            } catch (e) {
                alert('⚠️ Could not download. Please generate a recipe first.');
                playSound('error');
            }
        });

        // Initial UI setup
        updateUI();
    };

    init(); // Run the app
});
