document.addEventListener("DOMContentLoaded", function() {
  const fileFilter = document.getElementById('file-filter');
  const fileListContainer = document.getElementById('file-list-container');
  const modelFilter = document.getElementById('model-filter');
  const modelListContainer = document.getElementById('model-list-container');
  const characteristicsDisplay = document.getElementById('characteristics-display');
  const tInput = document.getElementById('t');
  const saveInput = document.getElementById('save');
  const invulnerableInput = document.getElementById('invulnerable');
  const woundsInput = document.getElementById('wounds');
  let xmlDoc; // Declare xmlDoc variable to hold the parsed XML document

  async function fetchDefFileNames() {
    try {
      const response = await fetch('http://localhost:3000/wh40k-10e');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const def_files = await response.json();
      const def_catFiles = def_files.filter(def_file => def_file.endsWith('.cat'));
      const def_fileNames = def_catFiles.map(def_file => def_file.replace('.cat', ''));
      populateFileList(def_fileNames);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }

  function populateDefFileList(def_fileArray) {
    fileDefListContainer.innerHTML = '';
    def_fileArray.forEach(file => {
      const option = document.createElement('option');
      option.value = file;
      fileDefListContainer.appendChild(option);
    });
  }

  async function fetchModelNames(fileName) {
    try {
      const response = await fetch(`http://localhost:3000/wh40k-10e/${encodeURIComponent(fileName)}.cat`);
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const fileContent = await response.text();
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(fileContent, "application/xml"); // Assign xmlDoc here
      const profiles = xmlDoc.querySelectorAll('profile');
      const modelNames = Array.from(profiles)
        .filter(profile => profile.querySelector('characteristic[name="T"]') && profile.querySelector('characteristic[name="SV"]') && profile.querySelector('characteristic[name="W"]'))
        .map(profile => profile.getAttribute('name'));
      console.log('Model Names:', modelNames);  // Log model names
      populateModelList(modelNames);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  }

  function populateModelList(modelArray) {
    modelListContainer.innerHTML = '';
    modelArray.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      modelListContainer.appendChild(option);
    });

    modelFilter.addEventListener('change', function() {
      const selectedModel = modelFilter.value;
      displayCharacteristics(selectedModel);
    });
  }

  function displayCharacteristics(modelName) {
    console.log('Selected Model:', modelName);  // Log selected model

    // Find the selectionEntry for the model
    const selectionEntry = Array.from(xmlDoc.querySelectorAll('selectionEntry')).find(entry => entry.querySelector(`profile[name="${modelName}"]`));
    console.log('Selection Entry:', selectionEntry);  // Log selection entry

    if (selectionEntry) {
      // Find the profile within the selectionEntry
      const profile = selectionEntry.querySelector(`profile[name="${modelName}"]`);
      console.log('Profile:', profile);  // Log profile

      if (profile) {
        const characteristics = profile.querySelectorAll('characteristic');
        const characteristicsMap = {};

        characteristics.forEach(characteristic => {
          const name = characteristic.getAttribute('name');
          const value = characteristic.textContent;
          characteristicsMap[name] = value;
        });

        console.log('Characteristics Map:', characteristicsMap);  // Log characteristics map

        const T = characteristicsMap['T'];
        const SV = characteristicsMap['SV'];
        const W = characteristicsMap['W'];

        // Extract and display invulnerable save value
        const invulnerableSaveValue = getInvulnerableSaveValue(selectionEntry);
        
        // Set input values
        tInput.value = T || '';
        saveInput.value = SV || '';
        invulnerableInput.value = invulnerableSaveValue !== 'N/A' ? invulnerableSaveValue : '';
        woundsInput.value = W || '';
      } else {
        clearInputValues();
      }
    } else {
      clearInputValues();
    }
  }

  function getInvulnerableSaveValue(selectionEntry) {
    let invulnerableSaveValue = 'N/A';

    // Check if there's a profile with the exact name "Invulnerable Save"
    const invulnerableSaveProfile = Array.from(selectionEntry.querySelectorAll('profile')).find(profile => profile.getAttribute('name').includes('Invulnerable Save'));
    console.log('Invulnerable Save Profile:', invulnerableSaveProfile);  // Log invulnerable save profile

    if (invulnerableSaveProfile) {
      const characteristic = invulnerableSaveProfile.querySelector('characteristic[name="Description"]');
      if (characteristic) {
        const invulnerableSaveText = characteristic.textContent.trim();
        const regex = /(\d+\+)/;
        const match = invulnerableSaveText.match(regex);
        invulnerableSaveValue = match ? match[0] : 'N/A';
        console.log('Direct Invulnerable Save Text:', invulnerableSaveValue);  // Log invulnerable savje text
      }
    } else {
      // If not found directly, fallback to the infoLink method
      const invulnerableSaveInfoLink = Array.from(selectionEntry.querySelectorAll('infoLink')).find(infoLink => infoLink.getAttribute('name').includes('Invulnerable Save'));
      console.log('Invulnerable Save InfoLink:', invulnerableSaveInfoLink);  // Log infoLink

      if (invulnerableSaveInfoLink) {
        const targetId = invulnerableSaveInfoLink.getAttribute('targetId');
        const invulnerableSaveProfile = xmlDoc.querySelector(`profile[id="${targetId}"]`);
        console.log('Invulnerable Save Profile:', invulnerableSaveProfile);  // Log invulnerable save profile

        if (invulnerableSaveProfile) {
          const invulnerableSaveComment = invulnerableSaveProfile.querySelector('comment');
          console.log('Invulnerable Save Comment:', invulnerableSaveComment);  // Log invulnerable save comment

          if (invulnerableSaveComment) {
            const invulnerableSaveText = invulnerableSaveComment.textContent.trim();
            console.log('Invulnerable Save Text:', invulnerableSaveText);  // Log invulnerable save text
            // Extract the number followed by '+'
            const regex = /(\d+\+)/;
            const match = invulnerableSaveText.match(regex);
            invulnerableSaveValue = match ? match[0] : 'N/A';
          }
        }
      }
    }

    return invulnerableSaveValue;
  }

  function clearInputValues() {
    tInput.value = '';
    saveInput.value = '';
    invulnerableInput.value = '';
    woundsInput.value = '';
  }

  fetchDefFileNames();

  fileFilter.addEventListener('input', function() {
    const searchText = fileFilter.value.toLowerCase();
    const options = fileListContainer.querySelectorAll('option');
    options.forEach(option => {
      option.style.display = option.value.toLowerCase().includes(searchText) ? 'block' : 'none';
    });
  });

  fileFilter.addEventListener('change', function() {
    const selectedFile = fileFilter.value;
    fetchModelNames(selectedFile);
  });
});
