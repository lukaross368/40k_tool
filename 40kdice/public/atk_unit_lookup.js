document.addEventListener("DOMContentLoaded", function() {
  const atk_fileFilter = document.getElementById('atk_file-filter');
  const atk_fileListContainer = document.getElementById('atk_file-list-container');
  const atk_modelFilter = document.getElementById('atk_model-filter');
  const atk_modelListContainer = document.getElementById('atk_model-list-container');
  const atk_weaponsFilter = document.getElementById('atk_weapons-filter');
  const atk_weaponsListContainer = document.getElementById('atk_weapons-list-container');
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
      atk_fetchWeapons(selectedModel);
    });
  }

  async function atk_fetchWeapons(modelName) {
    try {
      if (!atk_xmlDoc) {
        throw new Error('XML document not initialized');
      }
      const profiles = atk_xmlDoc.querySelectorAll('profile');
      const weapons = Array.from(profiles)
        .filter(profile => {
          const typeName = profile.querySelector('typeName');
          return typeName && typeName.textContent.toLowerCase().includes('weapon');
        })
        .map(profile => profile.getAttribute('name'));

      atk_populateWeaponsList(weapons);
    } catch (error) {
      console.error('Error fetching weapons:', error);
    }
  }

  function atk_populateWeaponsList(weaponsArray) {
    atk_weaponsListContainer.innerHTML = '';
    weaponsArray.forEach(weapon => {
      const option = document.createElement('option');
      option.value = weapon;
      atk_weaponsListContainer.appendChild(option);
    });
  }

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