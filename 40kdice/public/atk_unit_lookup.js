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
  let initialStates = {}; // Track initial states of all fields
  let elementStates = {}; // Track states of individual elements for keywords

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
    saveInitialState();
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
  
      // Check if the keyword matches any predefined keywords
      predefinedKeywords.forEach(predefinedKeyword => {
        const trimmedPredefinedKeyword = predefinedKeyword.trim(); // Trim leading and trailing whitespace
        const lowerPredefinedKeyword = trimmedPredefinedKeyword.toLowerCase(); // Convert to lowercase
  
        if (lowerKeyword.includes(lowerPredefinedKeyword)) {
          if (!keywordsSet.has(trimmedKeyword)) { // Check if the keyword is already added
            keywordsSet.add(trimmedKeyword); // Add the keyword to the set if it matches
  
            // Create and append the option element
            const option = document.createElement('div');
            option.classList.add('option');
            option.textContent = trimmedKeyword;
            option.addEventListener('click', function() {
              this.classList.toggle('selected');
              handleKeywordSelection(trimmedKeyword); // Handle keyword selection
              updateKeywordsInput();
            });
            keywordsOptions.appendChild(option);
          }
        }
      });
    });
  
    // Event listener to toggle the dropdown display
    keywordsInput.addEventListener('click', function () {
      keywordsOptions.style.display = keywordsOptions.style.display === 'block' ? 'none' : 'block';
    });
  
    // Event listener to hide the dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!keywordsContainer.contains(e.target)) {
        keywordsOptions.style.display = 'none';
      }
    });
  }
  
  
  function updateKeywordsInput() {
    const selectedOptions = document.querySelectorAll('#keywords-options .option.selected');
    const selectedKeywords = Array.from(selectedOptions).map(option => option.textContent);
    keywordsInput.value = selectedKeywords.join(', ');
  }
  
  function saveInitialState() {
    initialStates = {
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
    };
  }

  function saveElementState(element) {
    elementStates[element.id] = element.value || element.checked;
  }

  function revertElementState(element) {
    if (elementStates.hasOwnProperty(element.id)) {
      if (element.type === 'checkbox') {
        element.checked = elementStates[element.id];
      } else {
        element.value = elementStates[element.id];
      }
    }
  }

  function handleKeywordSelection(keyword) {
    const keywordLower = keyword.toLowerCase();

    if (keywordLower.includes("rapid fire")) {
      saveElementState(attacksInput);
      const number = extractNumericalValue(keyword);
      if (number) {
        if (attacksInput.value.includes('+')) {
          attacksInput.value = attacksInput.value.replace(/\+\d+$/, `+${number}`);
        } else {
          attacksInput.value += `+${number}`;
        }
      } else {
        revertElementState(attacksInput);
      }
    } else if (keywordLower.includes("ignores cover")) {
      saveElementState(document.getElementById('cover'));
      document.getElementById('cover').checked = false;
    } else if (keywordLower.includes("twin-linked")) {
      saveElementState(document.getElementById('wound_reroll'));
      document.getElementById('wound_reroll').value = "fail";
    } else if (keywordLower.includes("lethal hits")) {
      saveElementState(document.getElementById('hit_leth'));
      document.getElementById('hit_leth').checked = true;
    } else if (keywordLower.includes("lance")) {
      saveElementState(document.getElementById('wound_mod'));
      const currentMod = parseInt(document.getElementById('wound_mod').value) || 0;
      document.getElementById('wound_mod').value = currentMod + 1;
    } else if (keywordLower.includes("indirect fire")) {
      saveElementState(document.getElementById('bs'));
      document.getElementById('bs').value = "4+";
    } else if (keywordLower.includes("melta")) {
      saveElementState(damageInput);
      const number = extractNumericalValue(keyword);
      if (number) {
        if (damageInput.value.includes('+')) {
          damageInput.value = damageInput.value.replace(/\+\d+$/, `+${number}`);
        } else {
          damageInput.value += `+${number}`;
        }
      } else {
        revertElementState(damageInput);
      }
    } else if (keywordLower.includes("heavy")) {
      saveElementState(document.getElementById('hit_mod'));
      const currentMod = parseInt(document.getElementById('hit_mod').value) || 0;
      document.getElementById('hit_mod').value = `${currentMod + 1}`;
    } else if (keywordLower.includes("devastating wounds")) {
      saveElementState(document.getElementById('wound_dev'));
      document.getElementById('wound_dev').checked = true;
    } else if (keywordLower.includes("sustained hits")) {
      saveElementState(document.getElementById('hit_sus'));
      const number = extractNumericalValue(keyword);
      if (number) {
        document.getElementById('hit_sus').value = number;
      } else {
        revertElementState(document.getElementById('hit_sus'));
      }
    } else if (keywordLower.includes("anti")) {
      saveElementState(document.getElementById('wound_crit'));
      const number = extractNumericalValue(keyword);
      if (number) {
        document.getElementById('wound_crit').value = number;
      } else {
        revertElementState(document.getElementById('wound_crit'));
      }
    }

    updateKeywordsInput(); // Update the input value after keyword handling
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

  function revertToInitialState() {
    if (initialStates) {
      attacksInput.value = initialStates.attacks;
      tohitInput.value = initialStates.bs;
      strengthInput.value = initialStates.strength;
      armourpenInput.value = initialStates.armourPen;
      damageInput.value = initialStates.damage;
      document.getElementById('hit_mod').value = initialStates.hitModifier;
      document.getElementById('hit_leth').checked = initialStates.hitLethal;
      document.getElementById('hit_sus').value = initialStates.sustainedHits;
      document.getElementById('hit_crit').value = initialStates.criticalHit;
      document.getElementById('hit_of_6').value = initialStates.criticalHitRolls;
      document.getElementById('hit_reroll').value = initialStates.rerollHit;
      document.getElementById('wound_mod').value = initialStates.woundModifier;
      document.getElementById('wound_dev').checked = initialStates.woundDevastating;
      document.getElementById('wound_crit').value = initialStates.criticalWound;
      document.getElementById('wound_of_6').value = initialStates.criticalWoundRolls;
      document.getElementById('wound_reroll').value = initialStates.rerollWound;
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
      revertToInitialState(); // Revert to initial state if any
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
    initialStates = {}; // Clear initial states
  });

  modelInput.addEventListener('change', function() {
    weaponInput.value = '';
    atk_weaponsListContainer.innerHTML = '';
    keywordsOptions.innerHTML = ''; // Clears the keywords dropdown
    keywordsInput.value = ''; // Clears the keywords input field
    resetFields(); // Reset fields when model changes
    initialStates = {}; // Clear initial states
  });
});