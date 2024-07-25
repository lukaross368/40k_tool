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
  const coverInput= document.getElementById('cover');
  const woundrerollInput= document.getElementById('wound_reroll');
  const lethalInput = document.getElementById('hit_leth');
  const heavyInput = document.getElementById('hit_mod');
  const lanceInput = document.getElementById('wound_mod');
  const devwoundsInput = document.getElementById('wound_dev');
  const sustainedInput = document.getElementById('hit_sus');
  const antiInput = document.getElementById('wound_crit');
  const keywordsOptions = document.getElementById('keywords-options');
  const keywordsInput = document.getElementById('keywords-input');

  let atk_xmlDoc; // Variable to hold the parsed XML document
  let currentWeapon = ''; // Track the current weapon
  const elementStates = {}; // Declare elementStates object to track states

  async function atk_fetchFileNames() {
      const response = await fetch('http://localhost:3000/wh40k-10e');
      if (!response.ok) {
        throw new Error('Failed to fetch file names');
      }
      const files = await response.json();
      const catFiles = files.filter(file => file.endsWith('.cat'));
      const fileNames = catFiles.map(file => file.replace('.cat', ''));
      atk_populateFileList(fileNames);
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
    currentWeapon = weaponName;

    const weaponProfiles = atk_xmlDoc.querySelectorAll(`profile[name="${weaponName}"]`);

    // Use the first profile if there are multiple
    const selectedProfile = weaponProfiles.length > 0 ? weaponProfiles[0] : null;

    if (!selectedProfile) {
      return;
    }

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
              if (this.classList.contains('selected')) {
                handleKeywordSelection(trimmedKeyword);
              } else {
                revertElementState(trimmedKeyword);
              }
            
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
  }
  
  function saveElementState(element) {
    if (element.type === 'checkbox') {
      elementStates[element.id] = element.checked;
    } else {
      elementStates[element.id] = element.value 
    }
    return elementStates[element.id]
  }


  function revertElementState(keyword) {
    const keywordLower = keyword.toLowerCase();
  
    if (keywordLower.includes("rapid fire")) {
      // Assuming that attacksInput is the element we are reverting for this example
      if (elementStates[attacksInput.id] !== undefined) {
        attacksInput.value = elementStates[attacksInput.id];
      } 
    } 
    else if (keywordLower.includes("ignores cover")) {
      if (elementStates[coverInput.id] !== undefined) {
        coverInput.checked = elementStates[coverInput.id];
      }
    }
    else if (keywordLower.includes("twin-linked")) {
      if (elementStates[woundrerollInput.id] !== undefined) {
        woundrerollInput.value = elementStates[woundrerollInput.id];
      } 
    }
    else if (keywordLower.includes("lethal hits")) {
      if (elementStates[lethalInput.id] !== undefined) {
        lethalInput.checked = elementStates[lethalInput.id];
      } 
    }
    else if (keywordLower.includes("lance")) {
      // Assuming that attacksInput is the element we are reverting for this example
      if (elementStates[lanceInput.id] !== undefined) {
        lanceInput.value = elementStates[lanceInput.id];
      }
    }
    else if (keywordLower.includes("indirect fire")) {
      // Assuming that attacksInput is the element we are reverting for this example
      if (elementStates[tohitInput.id] !== undefined) {
        tohitInput.value = elementStates[tohitInput.id];
      }
    }
    else if (keywordLower.includes("melta")) {
      // Assuming that attacksInput is the element we are reverting for this example
      if (elementStates[damageInput.id] !== undefined) {
        damageInput.value = elementStates[damageInput.id];
      }
    }
    else if (keywordLower.includes("heavy")) {
      // Assuming that attacksInput is the element we are reverting for this example
      if (elementStates[heavyInput.id] !== undefined) {
        heavyInput.value = elementStates[heavyInput.id];
      }
    }
    else if (keywordLower.includes("devastating wounds")) {
      if (elementStates[devwoundsInput.id] !== undefined) {
        devwoundsInput.checked = elementStates[devwoundsInput.id];
      }
    }
    else if (keywordLower.includes("sustained hits")) {
      // Assuming that attacksInput is the element we are reverting for this example
      if (elementStates[sustainedInput.id] !== undefined) {
        sustainedInput.value = elementStates[sustainedInput.id];
      }
    }
    else if (keywordLower.includes("anti")) {
      // Assuming that attacksInput is the element we are reverting for this example
      if (elementStates[antiInput.id] !== undefined) {
        antiInput.value = elementStates[antiInput.id];
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
      }
    } else if (keywordLower.includes("ignores cover")) {
        saveElementState(document.getElementById('cover'));
        document.getElementById('cover').checked = false;
    } else if (keywordLower.includes("twin-linked")) {
        saveElementState(woundrerollInput);
        woundrerollInput.value = "fail";
    } else if (keywordLower.includes("lethal hits")) {
        saveElementState(lethalInput);
        lethalInput.checked = true;
    } else if (keywordLower.includes("lance")) {
        const save_state = saveElementState(lanceInput);
        if (save_state) {
          lanceInput.value += `+1`;
        } else {
            lanceInput.value = +1;
      }
    } else if (keywordLower.includes("indirect fire")) {
        saveElementState(tohitInput);
        tohitInput.value = "4";
    } else if (keywordLower.includes("melta")) {
        saveElementState(damageInput);
        const number = extractNumericalValue(keyword);
      if (number) {
        if (damageInput.value.includes('+')) {
          damageInput.value = damageInput.value.replace(/\+\d+$/, `+${number}`);
        } else {
          damageInput.value += `+${number}`;
        }
      }
    } else if (keywordLower.includes("heavy")) {
        const save_state = saveElementState(heavyInput);
        if (save_state) {
          heavyInput.value += `+1`;
        } else {
          heavyInput.value = +1;
      }
    } else if (keywordLower.includes("devastating wounds")) {
        saveElementState(devwoundsInput);
        devwoundsInput.checked = true;
    } else if (keywordLower.includes("sustained hits")) {
      save_state = saveElementState(sustainedInput);
      const number = extractNumericalValue(keyword);
      if (save_state) {
          sustainedInput.value += `+${number}`;
        } else {
          sustainedInput.value = number;
        }
    } else if (keywordLower.includes("anti")) {
        save_state = saveElementState(antiInput);
        const number = extractNumericalValue(keyword);
        if (number < save_state || save_state === "") {
          antiInput.value = number;
        } 
      }
  }

  // Toggle options container visibility
  keywordsInput.addEventListener('click', () => {
    keywordsOptions.classList.toggle('active');
  });

  // Add event listener for weapon selection change
  weaponInput.addEventListener('change', function() {
    const selectedWeapon = weaponInput.value;
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
    keywordsOptions.innerHTML = '';
  });

  modelInput.addEventListener('change', function() {
    weaponInput.value = '';
    atk_weaponsListContainer.innerHTML = '';
    keywordsOptions.innerHTML = ''; // Clears the keywords dropdown
    keywordsInput.value = ''; // Clears the keywords input field
    keywordsOptions.innerHTML = '';

  });
});