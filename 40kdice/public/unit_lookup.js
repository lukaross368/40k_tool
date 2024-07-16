document.addEventListener("DOMContentLoaded", function() {
  const fileFilter = document.getElementById('file-filter');
  const fileListContainer = document.getElementById('file-list-container');
  const modelFilter = document.getElementById('model-filter');
  const modelListContainer = document.getElementById('model-list-container');
  const characteristicsDisplay = document.getElementById('characteristics-display');

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
          const xmlDoc = parser.parseFromString(fileContent, "application/xml");
          const selectionEntries = xmlDoc.querySelectorAll('selectionEntry[type="model"]');
          const modelNames = Array.from(selectionEntries).map(entry => entry.getAttribute('name'));
          populateModelList(modelNames, xmlDoc);
      } catch (error) {
          console.error('Error fetching models:', error);
      }
  }

  function populateModelList(modelArray, xmlDoc) {
      modelListContainer.innerHTML = '';
      modelArray.forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          modelListContainer.appendChild(option);
      });

      modelFilter.addEventListener('change', function() {
          const selectedModel = modelFilter.value;
          displayCharacteristics(selectedModel, xmlDoc);
      });
  }

  function displayCharacteristics(modelName, xmlDoc) {
      const selectionEntry = Array.from(xmlDoc.querySelectorAll('selectionEntry[type="model"]')).find(entry => entry.getAttribute('name') === modelName);
      if (selectionEntry) {
          const profile = selectionEntry.querySelector('profile[typeName="Unit"]');
          const characteristics = profile.querySelectorAll('characteristic');
          const characteristicsMap = {};

          characteristics.forEach(characteristic => {
              const name = characteristic.getAttribute('name');
              const value = characteristic.textContent.trim();
              characteristicsMap[name] = value;
          });

          const T = characteristicsMap['T'] || '';
          const SV = characteristicsMap['SV'] || '';
          const W = characteristicsMap['W'] || '';

          populateCharacteristicsInputs(T, SV, W);
      } else {
          populateCharacteristicsInputs('', '', '');
          characteristicsDisplay.innerHTML = '<p>No characteristics found for the selected model.</p>';
      }
  }

  function populateCharacteristicsInputs(T, SV, W) {
      document.getElementById('t').value = T;
      document.getElementById('save').value = SV;
      document.getElementById('wounds').value = W;
      // Additional characteristics can be populated similarly
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
