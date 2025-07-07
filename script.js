document.addEventListener('DOMContentLoaded', () => {
    // Convert text inputs to lowercase and no spaces
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('input', () => {
            input.value = input.value.toLowerCase().replace(/\s/g, '_');
        });
    });

    // Initialize collapsible sections
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(coll => {
        coll.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    });
     // Automatically open manifest and advanced settings
    toggleManifest();
    toggleAdvancedSettings();

});

function toggleManifest() {
    const content = document.getElementById('manifest-section');
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}
function toggleAdvancedSettings() {
    const content = document.getElementById('advanced-settings');
     if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}


function showOptions() {
    const type = document.querySelector('input[name="addon_type"]:checked').value;
    const allOptions = document.querySelectorAll('.addon-options');
    allOptions.forEach(option => option.style.display = 'none');

    document.getElementById('download-mcaddon').disabled = true;

    if (type === 'recipes') {
        document.getElementById('recipes-options').style.display = 'block';
    } else if (type === 'loot') {
        document.getElementById('loot-options').style.display = 'block';
    } else if (type === 'entities') {
        document.getElementById('entities-options').style.display = 'block';
    } else if (type === 'manual') {
        document.getElementById('manual-options').style.display = 'block';
        document.getElementById('download-mcaddon').disabled = false;
    }
}

function addFolder() {
    const container = document.getElementById('new-folders-container');
    const folderId = `new-folder-${container.children.length}`;
    const newFolderHTML = `
        <div id="${folderId}" class="section-box">
            <label>Folder Name: <input type="text" class="new-folder-name" placeholder="namespace"></label>
            <label>Upload Files: <input type="file" class="new-folder-files" multiple accept=".json"></label>
        </div>`;
    container.insertAdjacentHTML('beforeend', newFolderHTML);
}

function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function downloadAddon(packType) {
    const packName = document.getElementById('pack-name').value.trim() || 'my_addon';
    const description = document.getElementById('description').value.trim() || 'flowers_smells_good';
    const creator = document.getElementById('creator-name').value.trim() || 'unknown_minecraft';
    let minVersion = document.getElementById('min-version').value.trim().replace(/\./g, ', ');
    if (!minVersion) {
        minVersion = "1, 21, 0";
    }
    
    const zip = new JSZip();
    const bp = zip.folder(`${packName}_[bp]`);

    // Manifest
    const manifest = {
        format_version: 2,
        header: {
            name: packName,
            description: description,
            uuid: generateUuid(),
            version: [1, 0, 0],
            min_engine_version: minVersion.split(',').map(v => parseInt(v.trim(), 10))
        },
        metadata: {
            authors: [creator],
            generated_with: { "json_to_addon": ["0.02"] }
        },
        modules: [
            {
                description: description,
                type: "data",
                uuid: generateUuid(),
                version: [1, 0, 0]
            }
        ]
    };
    bp.file('manifest.json', JSON.stringify(manifest, null, "\t"));

    // Pack Info
    const packInfo = `
 - - - - - - - - - - - - - - - - - - - - -  Creator - - - - - - - - - - - - - - - - - - - - - -
YOUTUBE: https://youtube.com/@decodingmnetwork?si=gEvoBZJ4OfQlgWpq
MCPEDL: mcpedl.com/user/unknown-minecraft/
GITHUB: https://github.com/Unknownminecraft
DISCORD: https://discord.gg/jx4p9x9fQv
                                     ╒                   ╕
〰〰〰〰〰〰〰〰〰〰 │|   Pack   info |│〰〰〰〰〰〰〰〰〰〰
                                     ╘                   ╛
    • website name= Json to addon
    • How to find? -> you will find this from my GitHub repository. (Why link not mentioned -> because it may change in future)
    • What this website does? -> This simply collect the json files and turn them into Minecraft addon.
    • What else this does? -> You can make a custom empty add-on (.mcaddon)
    • Do Creator has other usefull websites or addon maker?  ->   For other useful thing first join my discord server then   (https://discord.com/channels/1282722925887094918/1379105086135074846)   open this! [Hidden channel]`;
    bp.file('pack_info.txt', packInfo);
    
     // Pack Icon
    const packIconFile = document.getElementById('pack-icon').files[0];
    if (packIconFile) {
        bp.file('pack_icon.png', packIconFile);
    } else {
        // In a real scenario, you'd fetch a default image.
        // For this example, we'll skip adding it if not provided.
        console.log("No pack icon uploaded, skipping.");
    }

    const type = document.querySelector('input[name="addon_type"]:checked')?.value;

    if (type === 'recipes') {
        const recipesFolder = bp.folder(document.getElementById('recipes-folder-name').value || 'recipes');
        const files = document.getElementById('recipes-files').files;
        for (const file of files) {
            recipesFolder.file(file.name, file);
        }
        document.querySelectorAll('#new-folders-container .section-box').forEach(folderDiv => {
            const folderName = folderDiv.querySelector('.new-folder-name').value;
            const folderFiles = folderDiv.querySelector('.new-folder-files').files;
            if (folderName) {
                const subFolder = recipesFolder.folder(folderName);
                for (const file of folderFiles) {
                    subFolder.file(file.name, file);
                }
            }
        });
    } else if (type === 'loot') {
        const lootTableFolder = bp.folder('loot_tables');
        const entitiesFolder = lootTableFolder.folder('entities');
        const equipmentFolder = lootTableFolder.folder('equipment');
        const fishingFolder = lootTableFolder.folder('gameplay').folder('fishing');
        const chestFolder = lootTableFolder.folder('chests');
        const functionsFolder = bp.folder('functions');
        
        for (const file of document.getElementById('loot-table-files').files) lootTableFolder.file(file.name, file);
        for (const file of document.getElementById('entities-files-loot').files) entitiesFolder.file(file.name, file);
        for (const file of document.getElementById('equipment-files').files) equipmentFolder.file(file.name, file);
        for (const file of document.getElementById('fishing-files').files) fishingFolder.file(file.name, file);
        for (const file of document.getElementById('chest-files').files) chestFolder.file(file.name, file);
        for (const file of document.getElementById('function-files-loot').files) functionsFolder.file(file.name, file);
        
    } else if (type === 'entities') {
        const entitiesFolder = bp.folder('entities');
        const lootTableFolder = bp.folder('loot_tables');
        const spawnRulesFolder = bp.folder('spawn_rules');
        const functionsFolder = bp.folder('functions');
        
        for (const file of document.getElementById('entities-files-custom').files) entitiesFolder.file(file.name, file);
        for (const file of document.getElementById('loot-table-files-custom').files) lootTableFolder.file(file.name, file);
        for (const file of document.getElementById('spawn-rules-files').files) spawnRulesFolder.file(file.name, file);
        for (const file of document.getElementById('function-files-custom').files) functionsFolder.file(file.name, file);
    }

    // Manual Folder Creation
    if (packType === 'mcaddon' && type === 'manual') {
        const rp = zip.folder(`${packName}_[rp]`);
        
        // RP Manifest
        const rpManifest = JSON.parse(JSON.stringify(manifest)); // Deep copy
        rpManifest.header.uuid = generateUuid();
        rpManifest.modules[0].type = "resources";
        rpManifest.modules[0].uuid = generateUuid();
        rp.file('manifest.json', JSON.stringify(rpManifest, null, "\t"));
        if (packIconFile) {
            rp.file('pack_icon.png', packIconFile);
        }

        document.querySelectorAll('.rp-folder:checked').forEach(cb => rp.folder(cb.value));
        const customRpFolder = document.getElementById('rp-custom-folder').value.trim();
        if(customRpFolder) rp.folder(customRpFolder);
        
        document.querySelectorAll('.bp-folder:checked').forEach(cb => bp.folder(cb.value));
        const customBpFolder = document.getElementById('bp-custom-folder').value.trim();
        if(customBpFolder) bp.folder(customBpFolder);
        
        // Handle json files
         document.querySelectorAll('.rp-json:checked').forEach(cb => {
            const fileName = cb.value;
            let content = '{}'; // Default empty json
             if (fileName === 'biomes_client.json') content = `{"biomes": {"default": {"remove_all_prior_fog": true, "water_surface_transparency": 0.40, "water_fog_distance": 1000}}}`;
             if (fileName === 'terrain_texture.json') content = `{"num_mip_levels": 4, "padding": 8, "resource_pack_name": "${packName}", "texture_name": "atlas.terrain", "texture_data": {}}`;
             if (fileName === 'item_texture.json') content = `{"resource_pack_name": "${packName}", "texture_name": "atlas.items", "texture_data": {"custom:item_name": {"textures": "textures/folder_name/item_name"}}}`;
             if (fileName === 'flipbook_textures.json') content = `[{"flipbook_texture": "textures/blocks/block_name", "atlas_tile": "block_name", "atlas_index": 1, "ticks_per_frame": 3}]`;
             if (fileName === 'music_definitions.json') content = `{"biome_name": {"event_name": "music.game.biome_name", "min_delay": 60, "max_delay": 180}}`;

            rp.file(fileName, content);
        });
    }

    // Generate and download zip
    zip.generateAsync({type:"blob"}).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${packName}.${packType}.zip`; // Append .zip as per instruction
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
