document.addEventListener("DOMContentLoaded", function() {
  const fileFilter = document.getElementById('file-filter');
  const fileListContainer = document.getElementById('file-list-container');
  const modelFilter = document.getElementById('model-filter');
  const modelListContainer = document.getElementById('model-list-container');
  const characteristicsDisplay = document.getElementById('characteristics-display');
  let xmlDoc; // Declare xmlDoc variable to hold the parsed XML document

  async function fetchFileNames() {
    try {
      const response = await fetch('http://localhost:3000/wh40k-10e');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const files = await response.json();
      const catFiles = files.filter(file => file.endsWith('.cat'));
      const fileNames = catFiles.map(file => file.replace('.cat', ''));
      populateFileList(fileNames);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }

  function populateFileList(fileArray) {
    fileListContainer.innerHTML = '';
    fileArray.forEach(file => {
      const option = document.createElement('option');
      option.value = file;
      fileListContainer.appendChild(option);
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
    const profile = Array.from(xmlDoc.querySelectorAll('profile')).find(profile => profile.getAttribute('name') === modelName);
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

      // Check for Invulnerable Save
      let invulnerableSaveValue = 'N/A';
      const invulnerableSaveInfoLink = Array.from(profile.querySelectorAll('infoLink')).find(infoLink => infoLink.getAttribute('name').toLowerCase().includes('invulnerable save'));
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

      // Display the characteristics in HTML
      characteristicsDisplay.innerHTML = `
        <p><strong>T:</strong> ${T || 'N/A'}</p>
        <p><strong>SV:</strong> ${SV || 'N/A'}</p>
        <p><strong>W:</strong> ${W || 'N/A'}</p>
        <p><strong>Invulnerable Save:</strong> ${invulnerableSaveValue}</p>
      `;
    } else {
      characteristicsDisplay.innerHTML = '<p>No characteristics found for the selected model.</p>';
    }
  }

  fetchFileNames();

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