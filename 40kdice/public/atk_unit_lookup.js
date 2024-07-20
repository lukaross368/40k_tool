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

  let atk_xmlDoc; // Declare atk_xmlDoc variable to hold the parsed XML document

  async function atk_fetchFileNames() {
    try {
      const response = await fetch('http://localhost:3000/wh40k-10e');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const files = await response.json();
      const catFiles = files.filter(file => file.endsWith('.cat'));
      const fileNames = catFiles.map(file => file.replace('.cat', ''));
      atk_populateFileList(fileNames);
    } catch (error) {
      console.error('Error fetching files:', error);
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
        throw new Error('Failed to fetch');
      }
      const fileContent = await response.text();
      const parser = new DOMParser();
      atk_xmlDoc = parser.parseFromString(fileContent, "application/xml"); // Assign atk_xmlDoc here
      const profiles = atk_xmlDoc.querySelectorAll(':is(selectionEntry[type="unit"], selectionEntry[type="model"])');
      const modelNames = Array.from(profiles)
        .filter(profile => profile.querySelectorAll('characteristic[name="T"]') && profile.querySelector('characteristic[name="SV"]') && profile.querySelector('characteristic[name="W"]'))
        .map(profile => profile.getAttribute('name'));
      atk_populateModelList(modelNames);
    } catch (error) {
      console.error('Error fetching models:', error);
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

      // Find the selected model entry
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
      console.error('Error fetching weapons:', error);
    }
  }

  function atk_populateWeaponsList(weaponsArray) {
    const uniqueWeapons = [...new Set(weaponsArray)]; // Get unique elements using Set
  
    // Assuming atk_weaponsListContainer is a <select> element
    atk_weaponsListContainer.innerHTML = ''; // Clear existing options
  
    // Create and append new options
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
      console.error('XML document not initialized');
      return;
    }

    const weaponProfiles = atk_xmlDoc.querySelectorAll(`profile[name="${weaponName}"]`);
    weaponProfiles.forEach(profile => {
      const profileTypeName = profile.getAttribute('typeName');
      if (profileTypeName && profileTypeName.toLowerCase().includes('weapon')) {
        const characteristics = profile.querySelectorAll('characteristic');
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
              if (value !== 'N/A') {
                tohitInput.value = numericalValue;
              } else {
                tohitInput.value = '';
              }
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
                  const keywords = value.split(',').map(keyword => keyword.trim());
                  populateKeywordsSelect(keywords);
              }
              break;
            default:
              break;
          }
        });
      }
    });
  }

  // Function to populate the keywords options
  function populateKeywordsSelect(keywords) {
    if (!keywordsOptions) {
      console.error('Keywords options container not found');
      return;
    }

    const keywordsSet = new Set();
    keywords.forEach(keyword => keywordsSet.add(keyword));
    const keywordsArray = Array.from(keywordsSet);

    keywordsOptions.innerHTML = ''; // Clear existing options

    // Add the unique keywords as options
    keywordsArray.forEach(keyword => {
      const option = document.createElement('div');
      option.className = 'option';
      option.textContent = keyword;
      option.addEventListener('click', () => {
          option.classList.toggle('selected');
          updateKeywordsInput();
      });
      keywordsOptions.appendChild(option);
    });
  }

  // Function to update the keywords input box
  function updateKeywordsInput() {
    const selectedOptions = document.querySelectorAll('#keywords-options .option.selected');
    const selectedKeywords = Array.from(selectedOptions).map(option => option.textContent);
    keywordsInput.value = selectedKeywords.join(', ');
  }

  // Toggle options container visibility
  keywordsInput.addEventListener('click', () => {
    keywordsOptions.classList.toggle('active');
  });

  // Add event listener for weapon selection change
  weaponInput.addEventListener('change', function() {
    const selectedWeapon = weaponInput.value;
    console.log('Selected Weapon:', selectedWeapon);
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

  // Clear model and weapon input boxes when faction input changes
  factionInput.addEventListener('change', function() {
    modelInput.value = '';
    weaponInput.value = '';
    atk_modelListContainer.innerHTML = '';
    atk_weaponsListContainer.innerHTML = '';
  });

  // Clear weapon input box when model input changes
  modelInput.addEventListener('change', function() {
    weaponInput.value = '';
    atk_weaponsListContainer.innerHTML = '';
  });

});
