document.addEventListener("DOMContentLoaded", function() {
  const atk_fileFilter = document.getElementById('atk_file-filter');
  const atk_fileListContainer = document.getElementById('atk_file-list-container');
  const atk_modelFilter = document.getElementById('atk_model-filter');
  const atk_modelListContainer = document.getElementById('atk_model-list-container');
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
      const profiles = atk_xmlDoc.querySelectorAll('profile');
      const modelNames = Array.from(profiles)
        .filter(profile => profile.querySelector('characteristic[name="T"]') && profile.querySelector('characteristic[name="SV"]') && profile.querySelector('characteristic[name="W"]'))
        .map(profile => profile.getAttribute('name'));
      console.log('Model Names:', modelNames);  // Log model names
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
      atk_modelListContainer.appendChild(option);
    });

    atk_modelFilter.addEventListener('change', function() {
      const selectedModel = atk_modelFilter.value;
      atk_displayCharacteristics(selectedModel);
    });
  }

  // function displayCharacteristics(modelName) {
  //   console.log('Selected Model:', modelName);  // Log selected model

  //   // Find the selectionEntry for the model
  //   const selectionEntry = Array.from(xmlDoc.querySelectorAll('selectionEntry')).find(entry => entry.querySelector(`profile[name="${modelName}"]`));
  //   console.log('Selection Entry:', selectionEntry);  // Log selection entry

  //   if (selectionEntry) {
  //     // Find the profile within the selectionEntry
  //     const profile = selectionEntry.querySelector(`profile[name="${modelName}"]`);
  //     console.log('Profile:', profile);  // Log profile

  //     if (profile) {
  //       const characteristics = profile.querySelectorAll('characteristic');
  //       const characteristicsMap = {};

  //       characteristics.forEach(characteristic => {
  //         const name = characteristic.getAttribute('name');
  //         const value = characteristic.textContent;
  //         characteristicsMap[name] = value;
  //       });

  //       console.log('Characteristics Map:', characteristicsMap);  // Log characteristics map

  //       const T = characteristicsMap['T'];
  //       const SV = characteristicsMap['SV'];
  //       const W = characteristicsMap['W'];

  //       // Extract and display invulnerable save value
  //       const invulnerableSaveValue = getInvulnerableSaveValue(selectionEntry);
        
  //       // Set input values
  //       tInput.value = T || '';
  //       saveInput.value = SV || '';
  //       invulnerableInput.value = invulnerableSaveValue !== 'N/A' ? invulnerableSaveValue : '';
  //       woundsInput.value = W || '';
  //     } else {
  //       clearInputValues();
  //     }
  //   } else {
  //     clearInputValues();
  //   }
  // }

  // function getInvulnerableSaveValue(selectionEntry) {
  //   let invulnerableSaveValue = 'N/A';

  //   // Check if there's a profile with the exact name "Invulnerable Save"
  //   const invulnerableSaveProfile = Array.from(selectionEntry.querySelectorAll('profile')).find(profile => profile.getAttribute('name').includes('Invulnerable Save'));
  //   console.log('Invulnerable Save Profile:', invulnerableSaveProfile);  // Log invulnerable save profile

  //   if (invulnerableSaveProfile) {
  //     const characteristic = invulnerableSaveProfile.querySelector('characteristic[name="Description"]');
  //     if (characteristic) {
  //       const invulnerableSaveText = characteristic.textContent.trim();
  //       const regex = /(\d+\+)/;
  //       const match = invulnerableSaveText.match(regex);
  //       invulnerableSaveValue = match ? match[0] : 'N/A';
  //       console.log('Direct Invulnerable Save Text:', invulnerableSaveValue);  // Log invulnerable savje text
  //     }
  //   } else {
  //     // If not found directly, fallback to the infoLink method
  //     const invulnerableSaveInfoLink = Array.from(selectionEntry.querySelectorAll('infoLink')).find(infoLink => infoLink.getAttribute('name').includes('Invulnerable Save'));
  //     console.log('Invulnerable Save InfoLink:', invulnerableSaveInfoLink);  // Log infoLink

  //     if (invulnerableSaveInfoLink) {
  //       const targetId = invulnerableSaveInfoLink.getAttribute('targetId');
  //       const invulnerableSaveProfile = xmlDoc.querySelector(`profile[id="${targetId}"]`);
  //       console.log('Invulnerable Save Profile:', invulnerableSaveProfile);  // Log invulnerable save profile

  //       if (invulnerableSaveProfile) {
  //         const invulnerableSaveComment = invulnerableSaveProfile.querySelector('comment');
  //         console.log('Invulnerable Save Comment:', invulnerableSaveComment);  // Log invulnerable save comment

  //         if (invulnerableSaveComment) {
  //           const invulnerableSaveText = invulnerableSaveComment.textContent.trim();
  //           console.log('Invulnerable Save Text:', invulnerableSaveText);  // Log invulnerable save text
  //           // Extract the number followed by '+'
  //           const regex = /(\d+\+)/;
  //           const match = invulnerableSaveText.match(regex);
  //           invulnerableSaveValue = match ? match[0] : 'N/A';
  //         }
  //       }
  //     }
  //   }

  //   return invulnerableSaveValue;
  // }

  // function clearInputValues() {
  //   tInput.value = '';
  //   saveInput.value = '';
  //   invulnerableInput.value = '';
  //   woundsInput.value = '';
  // }

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
});