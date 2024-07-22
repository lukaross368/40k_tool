document.addEventListener("DOMContentLoaded", function() {
  const atk_fileFilter = document.getElementById('atk_file-filter');
  const atk_fileListContainer = document.getElementById('atk_file-list-container');
  const atk_modelFilter = document.getElementById('atk_model-filter');
  const atk_modelListContainer = document.getElementById('atk_model-list-container');
  const atk_weaponsListContainer = document.getElementById('atk_weapons-list-container');
  const factionInput = document.getElementById('atk_file-filter');
  const modelInput = document.getElementById('atk_model-filter');
  const weaponInput = document.getElementById('atk_weapons-filter');
  const attacksInput = document.getElementById('attacks');
  const tohitInput = document.getElementById('bs');
  const strengthInput = document.getElementById('s');
  const armourpenInput = document.getElementById('ap');
  const damageInput = document.getElementById('d');
  const keywordsOptions = document.getElementById('keywords-options');
  const keywordsInput = document.getElementById('keywords-input');

  let atk_xmlDoc; // Variable to hold the parsed XML document
  let currentWeapon = ''; // Track the current weapon
  let previousStates = {}; // Track previous states of the fields

  async function atk_fetchFileNames() {
    try {
      const response = await fetch('http://localhost:3000/wh40k-10e');
      if (!response.ok) {
        throw new Error('Failed to fetch file names');
      }
      const files = await response.json();
      const catFiles = files.filter(file => file.endsWith('.cat'));
      const fileNames = catFiles.map(file => file.replace('.cat', ''));
      atk_populateFileList(fileNames);
    } catch (error) {
      console.error(error);
    }
  }

  function atk_populateFileList(fileArray) {
    atk_fileListContainer.innerHTML = '';
    fileArray.forEach(file => {
      const option = document.createElement('option');
      option.value = file;
      option.textContent = file;
      atk_fileListContainer.appendChild(option);
    });
  }

  async function atk_fetchModelNames(fileName) {
    try {
      const response = await fetch(`http://localhost:3000/wh40k-10e/${encodeURIComponent(fileName)}.cat`);
      if (!response.ok) {
        throw new Error('Failed to fetch model names');
      }
      const fileContent = await response.text();
      const parser = new DOMParser();
      atk_xmlDoc = parser.parseFromString(fileContent, "application/xml");
      const profiles = atk_xmlDoc.querySelectorAll(':is(selectionEntry[type="unit"], selectionEntry[type="model"])');
      const modelNames = Array.from(profiles)
        .filter(profile => profile.querySelectorAll('characteristic[name="T"]') &&
          profile.querySelector('characteristic[name="SV"]') &&
          profile.querySelector('characteristic[name="W"]'))
        .map(profile => profile.getAttribute('name'));
      atk_populateModelList(modelNames);
    } catch (error) {
      console.error(error);
    }
  }

  function atk_populateModelList(modelArray) {
    atk_modelListContainer.innerHTML = '';
    modelArray.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      atk_modelListContainer.appendChild(option);
    });

    atk_modelFilter.addEventListener('change', function() {
      const selectedModel = atk_modelFilter.value;
      atk_fetchWeapons(selectedModel);
    });
  }

  async function atk_fetchWeapons(modelName) {
    try {
      if (!atk_xmlDoc) {
        throw new Error('XML document not initialized');
      }

      const modelEntries = atk_xmlDoc.querySelectorAll(':is([type="unit"], [type="model"])');
      let selectedModelEntry = null;

      modelEntries.forEach(entry => {
        const entryName = entry.getAttribute('name');
        if (entryName.toLowerCase() === modelName.toLowerCase()) {
          selectedModelEntry = entry;
        }
      });

      if (!selectedModelEntry) {
        throw new Error(`Model entry for ${modelName} not found`);
      }

      const weaponNames = new Set();
      const childElements = selectedModelEntry.querySelectorAll('*');

      childElements.forEach(child => {
        if (child.tagName === 'profile') {
          const profileTypeName = child.getAttribute('typeName');
          if (profileTypeName && profileTypeName.toLowerCase().includes('weapon')) {
            const profileName = child.getAttribute('name');
            weaponNames.add(profileName);
          }
        } else if (child.tagName === 'entryLink') {
          const targetId = child.getAttribute('targetId');
          const targetElements = atk_xmlDoc.querySelectorAll(`selectionEntry[id="${targetId}"]`);
      
          targetElements.forEach(target => {
            const targetProfiles = target.querySelectorAll('profile');
            targetProfiles.forEach(profile => {
              const profileTypeName = profile.getAttribute('typeName');
              if (profileTypeName && profileTypeName.toLowerCase().includes('weapon')) {
                const profileName = profile.getAttribute('name');
                weaponNames.add(profileName);
              }
            });
          });
        }
      });

      atk_populateWeaponsList(Array.from(weaponNames));
  
    } catch (error) {
      console.error(error);
    }
  }

  function atk_populateWeaponsList(weaponsArray) {
    const uniqueWeapons = [...new Set(weaponsArray)]; // Get unique elements using Set
  
    atk_weaponsListContainer.innerHTML = ''; // Clear existing options
  
    uniqueWeapons.forEach(weapon => {
      const option = document.createElement('option');
      option.value = weapon;
      option.textContent = weapon;
      atk_weaponsListContainer.appendChild(option);
    });
  }

  function extractNumericalValue(text) {
    const match = text.match(/\d+/);
    return match ? match[0] : '';
  }

  function populateWeaponCharacteristics(weaponName) {
    if (!atk_xmlDoc) {
      return;
    }

    if (currentWeapon === weaponName) {
      return;
    }

    // Save the current state before changing
    previousStates[currentWeapon] = getCurrentState();
    currentWeapon = weaponName;

    const weaponProfiles = atk_xmlDoc.querySelectorAll(`profile[name="${weaponName}"]`);

    // Use the first profile if there are multiple
    const selectedProfile = weaponProfiles.length > 0 ? weaponProfiles[0] : null;

    if (!selectedProfile) {
      return;
    }

    // Reset fields before populating new values
    resetFields();

    let keywords = [];

    const profileTypeName = selectedProfile.getAttribute('typeName');
    if (profileTypeName && profileTypeName.toLowerCase().includes('weapon')) {
      const characteristics = selectedProfile.querySelectorAll('characteristic');
      characteristics.forEach(characteristic => {
        const name = characteristic.getAttribute('name');
        const value = characteristic.textContent;

        const numericalValue = extractNumericalValue(value);

        switch (name) {
          case 'A':
            attacksInput.value = value;
            break;
          case 'WS':
          case 'BS':
            tohitInput.value = value !== 'N/A' ? numericalValue : '';
            break;
          case 'S':
            strengthInput.value = numericalValue;
            break;
          case 'AP':
            armourpenInput.value = numericalValue;
            break;
          case 'D':
            damageInput.value = value;
            break;
          case 'Keywords':
            if (value !== '-') {
              keywords = value.split(',').map(keyword => keyword.trim());
            }
            break;
          default:
            break;
        }
      });
    }
    
    if (keywords.length > 0) {
      populateKeywordsSelect(keywords);
    }
  }

  const predefinedKeywords = [
    "rapid fire",
    "ignores cover",
    "twin-linked",
    "lethal hits",
    "lance",
    "indirect fire",
    "melta",
    "heavy",
    "devastating wounds",
    "sustained hits",
    "anti"
  ];
  
  function populateKeywordsSelect(keywords) {
    if (!keywordsOptions) {
      return;
    }
  
    keywordsOptions.innerHTML = ''; // Clear existing options
  
    const keywordsSet = new Set();
  
    keywords.forEach(keyword => {
      const trimmedKeyword = keyword.trim(); // Trim leading and trailing whitespace
      const lowerKeyword = trimmedKeyword.toLowerCase(); // Convert to lowercase
  
      predefinedKeywords.forEach(predefinedKeyword => {
        const trimmedPredefinedKeyword = predefinedKeyword.trim(); // Trim leading and trailing whitespace
        const lowerPredefinedKeyword = trimmedPredefinedKeyword.toLowerCase(); // Convert to lowercase
  
        if (lowerKeyword.includes(lowerPredefinedKeyword)) {
          keywordsSet.add(trimmedKeyword); // Add the keyword to the set if it matches
        }
      });
    });
  
    const keywordsArray = Array.from(keywordsSet); // Convert set to array
  
    // Add the unique keywords as options
    keywordsArray.forEach(keyword => {
      const option = document.createElement('div');
      option.className = 'option';
      option.textContent = keyword;
      option.addEventListener('click', () => {
        option.classList.toggle('selected');
        updateKeywordsInput();
        applyKeywordEffects();
      });
      keywordsOptions.appendChild(option);
    });
  }

  function updateKeywordsInput() {
    const selectedOptions = document.querySelectorAll('#keywords-options .option.selected');
    const selectedKeywords = Array.from(selectedOptions).map(option => option.textContent);
    keywordsInput.value = selectedKeywords.join(', ');
  }

  function getCurrentState() {
    // Capture the state of input fields
    const state = {
      attacks: attacksInput.value,
      bs: tohitInput.value,
      strength: strengthInput.value,
      armourPen: armourpenInput.value,
      damage: damageInput.value,
      hitModifier: document.getElementById('hit_mod').value,
      hitLethal: document.getElementById('hit_leth').checked,
      sustainedHits: document.getElementById('hit_sus').value,
      criticalHit: document.getElementById('hit_crit').value,
      criticalHitRolls: document.getElementById('hit_of_6').value,
      rerollHit: document.getElementById('hit_reroll').value,
      woundModifier: document.getElementById('wound_mod').value,
      woundDevastating: document.getElementById('wound_dev').checked,
      criticalWound: document.getElementById('wound_crit').value,
      criticalWoundRolls: document.getElementById('wound_of_6').value,
      rerollWound: document.getElementById('wound_reroll').value,
      keywordsInput: keywordsInput.value
    };
  
    return state;
  }

  function applyKeywordEffects() {
    const selectedKeywords = Array.from(document.querySelectorAll('#keywords-options .option.selected')).map(option => option.textContent.toLowerCase());

    if (selectedKeywords.includes("rapid fire")) {
      const number = extractNumericalValue(attacksInput.value);
      if (number) {
        attacksInput.value = `+${number}`;
      }
    }
    if (selectedKeywords.includes("ignores cover")) {
      document.getElementById('cover').checked = false;
    }
    if (selectedKeywords.includes("twin-linked")) {
      document.getElementById('wound_reroll').value = "fail";
    }
    if (selectedKeywords.includes("lethal hits")) {
      document.getElementById('hit_leth').checked = true;
    }
    if (selectedKeywords.includes("lance")) {
      const currentMod = parseInt(document.getElementById('wound_mod').value) || 0;
      document.getElementById('wound_mod').value = currentMod + 1;
    }
    if (selectedKeywords.includes("indirect fire")) {
      document.getElementById('bs').value = "4+";
    }
    if (selectedKeywords.includes("melta")) {
      const number = extractNumericalValue(damageInput.value);
      if (number) {
        damageInput.value = `+${number}`;
      }
    }
    if (selectedKeywords.includes("heavy")) {
      const currentMod = parseInt(document.getElementById('hit_mod').value) || 0;
      document.getElementById('hit_mod').value = `${currentMod + 1}`;
    }
    if (selectedKeywords.includes("devastating wounds")) {
      document.getElementById('wound_dev').checked = true;
    }
    if (selectedKeywords.includes("sustained hits")) {
      const number = extractNumericalValue(keywordsInput.value);
      if (number) {
        document.getElementById('hit_sus').value = number;
      }
    }
    if (selectedKeywords.includes("anti")) {
      const number = extractNumericalValue(keywordsInput.value);
      if (number) {
        document.getElementById('wound_crit').value = number;
      }
    }
  }

  function resetFields() {
    attacksInput.value = ''; // Default value if any
    document.getElementById('cover').checked = false;
    document.getElementById('wound_reroll').value = '';
    document.getElementById('hit_leth').checked = false;
    document.getElementById('wound_mod').value = '';
    document.getElementById('bs').value = '';
    document.getElementById('d').value = '';
    document.getElementById('hit_mod').value = '';
    document.getElementById('wound_dev').checked = false;
    document.getElementById('hit_sus').value = '';
    document.getElementById('wound_crit').value = '';
  }

  function revertToPreviousState() {
    if (previousStates[currentWeapon]) {
      const state = previousStates[currentWeapon];
      attacksInput.value = state.attacks;
      tohitInput.value = state.bs;
      strengthInput.value = state.strength;
      armourpenInput.value = state.armourPen;
      damageInput.value = state.damage;
      document.getElementById('hit_mod').value = state.hitModifier;
      document.getElementById('hit_leth').checked = state.hitLethal;
      document.getElementById('hit_sus').value = state.sustainedHits;
      document.getElementById('hit_crit').value = state.criticalHit;
      document.getElementById('hit_of_6').value = state.criticalHitRolls;
      document.getElementById('hit_reroll').value = state.rerollHit;
      document.getElementById('wound_mod').value = state.woundModifier;
      document.getElementById('wound_dev').checked = state.woundDevastating;
      document.getElementById('wound_crit').value = state.criticalWound;
      document.getElementById('wound_of_6').value = state.criticalWoundRolls;
      document.getElementById('wound_reroll').value = state.rerollWound;
      keywordsInput.value = state.keywordsInput;
    }
  }

  // Toggle options container visibility
  keywordsInput.addEventListener('click', () => {
    keywordsOptions.classList.toggle('active');
  });

  // Add event listener for weapon selection change
  weaponInput.addEventListener('change', function() {
    const selectedWeapon = weaponInput.value;
    if (currentWeapon) {
      revertToPreviousState(); // Revert to previous state if any
    }
    populateWeaponCharacteristics(selectedWeapon);
  });

  atk_fetchFileNames();

  atk_fileFilter.addEventListener('input', function() {
    const searchText = atk_fileFilter.value.toLowerCase();
    const options = atk_fileListContainer.querySelectorAll('option');
    options.forEach(option => {
      option.style.display = option.value.toLowerCase().includes(searchText) ? 'block' : 'none';
    });
  });

  atk_fileFilter.addEventListener('change', function() {
    const selectedFile = atk_fileFilter.value;
    atk_fetchModelNames(selectedFile);
  });

  factionInput.addEventListener('change', function() {
    modelInput.value = '';
    weaponInput.value = '';
    atk_modelListContainer.innerHTML = '';
    atk_weaponsListContainer.innerHTML = '';
    resetFields(); // Reset fields when faction changes
    previousStates = {}; // Clear previous states
  });

  modelInput.addEventListener('change', function() {
    weaponInput.value = '';
    atk_weaponsListContainer.innerHTML = '';
    keywordsOptions.innerHTML = ''; // Clears the keywords dropdown
    keywordsInput.value = ''; // Clears the keywords input field
    resetFields(); // Reset fields when model changes
    previousStates = {}; // Clear previous states
  });
});
