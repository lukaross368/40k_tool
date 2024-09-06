document.addEventListener('DOMContentLoaded', function () {
  const fileFilter = document.getElementById('file-filter');
  const fileListContainer = document.getElementById('file-list-container');
  const modelFilter = document.getElementById('model-filter');
  const modelListContainer = document.getElementById('model-list-container');
  const tInput = document.getElementById('t');
  const saveInput = document.getElementById('save');
  const invulnerableInput = document.getElementById('invulnerable');
  const woundsInput = document.getElementById('wounds');
  const fnpInput = document.getElementById('fnp');
  let xmlDoc; // Declare xmlDoc variable to hold the parsed XML document
  let marine_xmlDoc;

  async function fetchFileNames() {
    try {
      const response = await fetch('http://localhost:3000/wh40k-10e');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const files = await response.json();
      const catFiles = files.filter((file) => file.endsWith('.cat'));
      const fileNames = catFiles.map((file) => file.replace('.cat', ''));
      populateFileList(fileNames);
    } catch (error) {}
  }

  function populateFileList(fileArray) {
    fileListContainer.innerHTML = '';
    fileArray.forEach((file) => {
      const option = document.createElement('option');
      option.value = file;
      fileListContainer.appendChild(option);
    });
  }

  async function fetchModelNames(fileName) {
    try {
      const response = await fetch(
        `http://localhost:3000/wh40k-10e/${encodeURIComponent(fileName)}.cat`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const fileContent = await response.text();
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(fileContent, 'application/xml'); // Assign xmlDoc here
      const profiles = xmlDoc.querySelectorAll('profile');
      const modelNames = Array.from(profiles)
        .filter(
          (profile) =>
            profile.querySelector('characteristic[name="T"]') &&
            profile.querySelector('characteristic[name="SV"]') &&
            profile.querySelector('characteristic[name="W"]'),
        )
        .map((profile) => profile.getAttribute('name'));
      populateModelList(modelNames);
    } catch (error) {}
  }

  async function handleImperiumData(value, fileFilter, targetId) {
    // Check if the condition to fetch and parse data is met
    if (value === 'N/A' && fileFilter.value.includes('Imperium')) {
      try {
        // Fetch the XML file
        const marine_response = await fetch(
          `http://localhost:3000/wh40k-10e/Imperium - Space Marines.cat`,
        );

        if (!marine_response.ok) {
          throw new Error('Failed to fetch');
        }

        // Get the file content as text
        const marine_fileContent = await marine_response.text();
        const marine_parser = new DOMParser();
        const marine_xmlDoc = marine_parser.parseFromString(
          marine_fileContent,
          'application/xml',
        );

        // Query the XML document
        const Profile = marine_xmlDoc.querySelector(
          `profile[id="${targetId}"]`,
        );

        if (Profile) {
          const Comment = Profile.querySelector('comment');

          if (Comment) {
            const Text = Comment.textContent.trim();
            // Extract the number followed by '+'
            const regex = /(\d+\+)/;
            const match = Text.match(regex);
            value = match ? match[0] : 'N/A';
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }

      // Return the extracted value
      return value;
    }

    // If conditions are not met, return the initial value
    return value;
  }

  function populateModelList(modelArray) {
    modelListContainer.innerHTML = '';
    modelArray.forEach((model) => {
      const option = document.createElement('option');
      option.value = model;
      modelListContainer.appendChild(option);
    });

    modelFilter.addEventListener('change', function () {
      const selectedModel = modelFilter.value;
      displayCharacteristics(selectedModel);
    });
  }

  async function displayCharacteristics(modelName) {
    // Find the selectionEntry for the model
    const selectionEntry = Array.from(
      xmlDoc.querySelectorAll('selectionEntry'),
    ).find((entry) => entry.querySelector(`profile[name="${modelName}"]`));

    if (selectionEntry) {
      // Find the profile within the selectionEntry
      const profile = selectionEntry.querySelector(
        `profile[name="${modelName}"]`,
      );

      if (profile) {
        const characteristics = profile.querySelectorAll('characteristic');
        const characteristicsMap = {};

        characteristics.forEach((characteristic) => {
          const name = characteristic.getAttribute('name');
          const value = characteristic.textContent;
          characteristicsMap[name] = value;
        });

        const T = characteristicsMap['T'];
        const SV = characteristicsMap['SV'];
        const W = characteristicsMap['W'];

        // Extract and display invulnerable save value
        const invulnerableSaveValue = await getInvulnerableSaveValue(
          selectionEntry,
          fileFilter,
        );

        const fnpValue = await getFNPValue(selectionEntry);

        // Set input values
        tInput.value = T || '';
        saveInput.value = SV || '';
        invulnerableInput.value =
          invulnerableSaveValue !== 'N/A' ? invulnerableSaveValue : '';
        woundsInput.value = W || '';
        fnpInput.value = fnpValue || '';
      } else {
        clearInputValues();
      }
    } else {
      clearInputValues();
    }
  }

  async function getInvulnerableSaveValue(selectionEntry, fileFilter) {
    let invulnerableSaveValue = 'N/A';

    // Check if there's a profile with the exact name "Invulnerable Save"

    const invulnerableSaveProfile = Array.from(
      selectionEntry.querySelectorAll('profile'),
    ).find((profile) =>
      profile.getAttribute('name').includes('Invulnerable Save'),
    );

    if (invulnerableSaveProfile) {
      const characteristic = invulnerableSaveProfile.querySelector(
        'characteristic[name="Description"]',
      );

      if (characteristic) {
        const invulnerableSaveText = characteristic.textContent.trim();
        const regex = /(\d+\+)/;
        const match = invulnerableSaveText.match(regex);
        invulnerableSaveValue = match ? match[0] : 'N/A';
      }
    } else {
      // If not found directly, fallback to the infoLink method
      const invulnerableSaveInfoLink = Array.from(
        selectionEntry.querySelectorAll('infoLink'),
      ).find((infoLink) =>
        infoLink.getAttribute('name').includes('Invulnerable Save'),
      );

      if (invulnerableSaveInfoLink) {
        const targetId = invulnerableSaveInfoLink.getAttribute('targetId');
        const invulnerableSaveProfile = xmlDoc.querySelector(
          `profile[id="${targetId}"]`,
        );

        if (invulnerableSaveProfile) {
          const invulnerableSaveComment =
            invulnerableSaveProfile.querySelector('comment');

          if (invulnerableSaveComment) {
            const invulnerableSaveText =
              invulnerableSaveComment.textContent.trim();
            // Extract the number followed by '+'
            const regex = /(\d+\+)/;
            const match = invulnerableSaveText.match(regex);
            invulnerableSaveValue = match ? match[0] : 'N/A';
          }
        }
        invulnerableSaveValue = await handleImperiumData(
          (value = invulnerableSaveValue),
          fileFilter,
          targetId,
        );
      }
    }
    return invulnerableSaveValue;
  }

  async function getFNPValue(selectionEntry) {
    let fnpValue = 'N/A';

    // Check if there's a profile with the exact name "Invulnerable Save"

    const fnpProfile = Array.from(
      selectionEntry.querySelectorAll('infoLink'),
    ).find((profile) => profile.getAttribute('name').includes('Feel No Pain'));

    if (fnpProfile) {
      const characteristic = fnpProfile
        .querySelector('modifier')
        ?.getAttribute('value');

      if (characteristic) {
        const regex = /(\d+\+)/;
        const match = characteristic.match(regex);
        fnpValue = match ? match[0] : 'N/A';
      }
    } //else {
    // If not found directly, fallback to the infoLink method
    //   const fnpInfoLink = Array.from(
    //     selectionEntry.querySelectorAll('infoLink'),
    //   ).find((infoLink) =>
    //     infoLink.getAttribute('name').includes('Feel No Pain'),
    //   );

    //   if (fnpInfoLink) {
    //     const targetId = fnpInfoLink.getAttribute('targetId');
    //     const fnpProfile = xmlDoc.querySelector(
    //       `profile[id="${targetId}"]`,
    //     );

    //     if (fnpProfile) {
    //       const fnpComment =
    //         fnpProfile.querySelector('comment');

    //       if (fnpComment) {
    //         const fnpText =
    //           fnpComment.textContent.trim();
    //         // Extract the number followed by '+'
    //         const regex = /(\d+\+)/;
    //         const match = fnpText.match(regex);
    //         fnpValue = match ? match[0] : 'N/A';
    //       }
    //     }
    //     fnpValue = await handleImperiumData(
    //       value = fnpValue,
    //       fileFilter,
    //       targetId,
    //     );
    //   }
    // }
    return fnpValue;
  }

  function clearInputValues() {
    tInput.value = '';
    saveInput.value = '';
    invulnerableInput.value = '';
    woundsInput.value = '';
    fnpInput.value = '';
  }

  fetchFileNames();

  fileFilter.addEventListener('input', function () {
    const searchText = fileFilter.value.toLowerCase();
    const options = fileListContainer.querySelectorAll('option');
    options.forEach((option) => {
      option.style.display = option.value.toLowerCase().includes(searchText)
        ? 'block'
        : 'none';
    });
  });

  fileFilter.addEventListener('change', function () {
    const selectedFile = fileFilter.value;
    fetchModelNames(selectedFile);
  });
});
