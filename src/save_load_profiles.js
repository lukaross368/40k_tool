//////////////////////////////////////////////////////////////////////////////////////////
// Attacker save profiles
//////////////////////////////////////////////////////////////////////////////////////////

// Global variable to hold previous values
let previousAttackerValues = null;

// Function to save the current attacker's values
function saveCurrentAttackerValues() {
  previousAttackerValues = {
    previous_hit_dice: fetch_value('attacks'),
    previous_hit_stat: fetch_value('bs'),
    previous_hit_mod: fetch_value('hit_mod'),
    previous_hit_reroll: fetch_value('hit_reroll'),
    previous_hit_leth: is_checked('hit_leth'),
    previous_hit_sus: fetch_value('hit_sus'),
    previous_hit_crit: fetch_value('hit_crit'),
    previous_hit_of_6: fetch_value('hit_of_6'),
    previous_wound_mod: fetch_value('wound_mod'),
    previous_wound_reroll: fetch_value('wound_reroll'),
    previous_wound_dev: is_checked('wound_dev'),
    previous_wound_crit: fetch_value('wound_crit'),
    previous_wound_of_6: fetch_value('wound_of_6'),
    previous_strength: fetch_value('s'),
    previous_ap: fetch_value('ap'),
    previous_damage: fetch_value('d')
  };
}

// Function to repopulate the attacker fields with saved values
function repopulateAttackerFields(savedValues) {
  if (!savedValues) {
    console.warn("No previous values saved, skipping repopulation.");
    return; // Exit if no previous values are saved
  }

  set_value('attacks', savedValues.previous_hit_dice);
  set_value('bs', savedValues.previous_hit_stat);
  set_value('hit_mod', savedValues.previous_hit_mod);
  set_value('hit_reroll', savedValues.previous_hit_reroll);
  set_checked('hit_leth', savedValues.previous_hit_leth);
  set_value('hit_sus', savedValues.previous_hit_sus);
  set_value('hit_crit', savedValues.previous_hit_crit);
  set_value('hit_of_6', savedValues.previous_hit_of_6);
  set_value('wound_mod', savedValues.previous_wound_mod);
  set_value('wound_reroll', savedValues.previous_wound_reroll);
  set_checked('wound_dev', savedValues.previous_wound_dev);
  set_value('wound_crit', savedValues.previous_wound_crit);
  set_value('wound_of_6', savedValues.previous_wound_of_6);
  set_value('s', savedValues.previous_strength);
  set_value('ap', savedValues.previous_ap);
  set_value('d', savedValues.previous_damage);
}


// Function to save the attacker profile
function save_atk_profile() {
  let hit_dice = fetch_value('attacks');
  let hit_stat = fetch_int_value('bs');
  let hit_mod = fetch_int_value('hit_mod');
  let hit_reroll = fetch_value('hit_reroll');
  let hit_leth = is_checked('hit_leth');
  let hit_sus = fetch_value('hit_sus');
  let hit_crit = fetch_int_value('hit_crit');
  let hit_of_6 = fetch_value('hit_of_6');
  let s = fetch_int_value('s');
  let wound_mod = fetch_int_value('wound_mod');
  let wound_reroll = fetch_value('wound_reroll');
  let wound_dev = is_checked('wound_dev');
  let wound_crit = fetch_int_value('wound_crit');
  let wound_of_6 = fetch_value('wound_of_6');
  let ap_val = fetch_int_value('ap');
  let damage_val = fetch_value('d');

  let atk_profile = {
    hit_dice: hit_dice,
    hit_stat: hit_stat,
    hit_mod: hit_mod,
    hit_reroll: hit_reroll,
    hit_leth: hit_leth,
    hit_sus: hit_sus,
    hit_crit: hit_crit,
    hit_of_6: hit_of_6,
    s: s,
    wound_mod: wound_mod,
    wound_reroll: wound_reroll,
    wound_dev: wound_dev,
    wound_crit: wound_crit,
    wound_of_6: wound_of_6,
    ap_val: ap_val,
    damage_val: damage_val,
  };

  var atkprofileName = document.getElementById('atksaveprofile').value;

  if (!atkprofileName) {
    alert('Please enter a profile name.');
    return;
  }

  document.getElementById('atksaveprofile').value = '';

  let atkprofile_map =
    JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  atkprofile_map[atkprofileName] = atk_profile;
  localStorage.setItem('atk_profile_map', JSON.stringify(atkprofile_map));

  update_atk_profile_dropdown();
}

// Function to update the attack profile dropdown
function update_atk_profile_dropdown() {
  let atkprofile_map = JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  let dropdownList = document.getElementById('atk-profile-dropdown-list');
  let toggleButton = document.querySelector('#atk-profile-dropdown .custom-dropdown-selected');

  dropdownList.innerHTML = ''; // Clear the dropdown

  for (let atkprofileName in atkprofile_map) {
    let option = document.createElement('div');
    option.innerHTML = `
      <span>${atkprofileName}</span>
      <span class="remove-btn" onclick="remove_atk_profile('${atkprofileName}', event)">X</span>
    `;

    option.addEventListener('click', function (e) {
      if (!e.target.classList.contains('remove-btn')) {
        let selectedText = document.querySelector('#atk-profile-dropdown .custom-dropdown-selected').textContent;

        if (selectedText === atkprofileName) {
          // Deselect the current profile
          document.querySelector('#atk-profile-dropdown .custom-dropdown-selected').textContent = 'Select Saved Profile';
          highlightSelectedProfile(null); // Remove highlighting
          repopulateAttackerFields(previousAttackerValues); // Restore saved values if available
        } else {
          // Select a new profile
          document.querySelector('#atk-profile-dropdown .custom-dropdown-selected').textContent = atkprofileName;
          // saveCurrentAttackerValues(); // Save current values before switching profiles
          load_selected_atk_profile(atkprofileName); // Load new profile values
          highlightSelectedProfile(atkprofileName); // Highlight selected profile
        }
      }
    });

    dropdownList.appendChild(option);
  }

  // Auto-close the dropdown if no profiles are saved
  if (Object.keys(atkprofile_map).length === 0) {
    closeDropdown('atk-profile-dropdown-list');
    toggleButton.textContent = 'Select Saved Profile';
  } else {
    toggleButton.style.pointerEvents = 'auto';
    toggleButton.style.opacity = '1';
  }
}

// Function to close the dropdown if clicking outside of it
document.addEventListener('click', function (e) {
  const atkDropdown = document.getElementById('atk-profile-dropdown-list');
  const atkDropdownToggle = document.getElementById('atk-profile-dropdown');
  const defDropdown = document.getElementById('def-profile-dropdown-list');
  const defDropdownToggle = document.getElementById('def-profile-dropdown');

  if (
    !atkDropdown.contains(e.target) &&
    !atkDropdownToggle.contains(e.target)
  ) {
    closeDropdown('atk-profile-dropdown-list'); // Close attacker dropdown if clicked outside
  }

  if (
    !defDropdown.contains(e.target) &&
    !defDropdownToggle.contains(e.target)
  ) {
    closeDropdown('def-profile-dropdown-list'); // Close defender dropdown if clicked outside
  }
});

// Close the dropdown
function closeDropdown(listId) {
  document.getElementById(listId).style.display = 'none';
}

// Function to load selected profile from the dropdown
function load_selected_atk_profile(profileName) {
  let atkprofile_map =
    JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  let profile = atkprofile_map[profileName];

  if (profile) {
    set_value('attacks', profile.hit_dice);
    set_value('bs', profile.hit_stat);
    set_value('hit_mod', profile.hit_mod);
    set_value('hit_reroll', profile.hit_reroll);
    set_checked('hit_leth', profile.hit_leth);
    set_value('hit_sus', profile.hit_sus);
    set_value('hit_crit', profile.hit_crit);
    set_value('hit_of_6', profile.hit_of_6);
    set_value('s', profile.s);
    set_value('wound_mod', profile.wound_mod);
    set_value('wound_reroll', profile.wound_reroll);
    set_checked('wound_dev', profile.wound_dev);
    set_value('wound_crit', profile.wound_crit);
    set_value('wound_of_6', profile.wound_of_6);
    set_value('ap', profile.ap_val);
    set_value('d', profile.damage_val);
  } else {
    console.error('Profile not found');
  }
}

// Function to remove the selected attacker profile
function remove_atk_profile(profileName, event) {
  event.stopPropagation();
  let atkprofile_map =
    JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  delete atkprofile_map[profileName];
  localStorage.setItem('atk_profile_map', JSON.stringify(atkprofile_map));
  update_atk_profile_dropdown();
}

// Function to highlight the selected profile in blue
function highlightSelectedProfile(selectedProfile) {
  let profileItems = document.querySelectorAll(
    '#atk-profile-dropdown-list div',
  );
  profileItems.forEach(function (item) {
    item.classList.remove('selected');
    if (
      selectedProfile &&
      item.querySelector('span').textContent === selectedProfile
    ) {
      item.classList.add('selected');
    }
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Defender save profiles
//////////////////////////////////////////////////////////////////////////////////////////

// Function to save the defender profile
function save_def_profile() {
  let t = fetch_int_value('t');
  let save_stat = fetch_int_value('save');
  let invuln_stat = fetch_int_value('invulnerable');
  let save_mod = fetch_int_value('save_mod');
  let save_reroll = fetch_value('save_reroll');
  let cover = is_checked('cover');
  let wound_val = fetch_int_value('wounds');
  let fnp = fetch_int_value('fnp');

  let def_profile = {
    t: t,
    save_stat: save_stat,
    invuln_stat: invuln_stat,
    save_mod: save_mod,
    save_reroll: save_reroll,
    cover: cover,
    wound_val: wound_val,
    fnp: fnp,
  };

  var defprofileName = document.getElementById('defsaveprofile').value;

  if (!defprofileName) {
    alert('Please enter a profile name.');
    return;
  }

  document.getElementById('defsaveprofile').value = '';

  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  defprofile_map[defprofileName] = def_profile;
  localStorage.setItem('def_profile_map', JSON.stringify(defprofile_map));

  update_def_profile_dropdown();
}

// Function to update the defender profile dropdown with 'x' buttons
function update_def_profile_dropdown() {
  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  let dropdownList = document.getElementById('def-profile-dropdown-list');
  let toggleButton = document.querySelector(
    '#def-profile-dropdown .custom-dropdown-selected',
  );

  dropdownList.innerHTML = '';

  for (let defprofileName in defprofile_map) {
    let option = document.createElement('div');
    option.innerHTML = `
      <span>${defprofileName}</span>
      <span class="remove-btn" onclick="remove_def_profile('${defprofileName}', event)">X</span>
    `;

    option.addEventListener('click', function (e) {
      if (!e.target.classList.contains('remove-btn')) {
        let selectedText = document.querySelector(
          '#def-profile-dropdown .custom-dropdown-selected',
        ).textContent;
        if (selectedText === defprofileName) {
          document.querySelector(
            '#def-profile-dropdown .custom-dropdown-selected',
          ).textContent = 'Select Saved Profile';
          highlightSelectedDefProfile(null); // Remove highlighting
        } else {
          document.querySelector(
            '#def-profile-dropdown .custom-dropdown-selected',
          ).textContent = defprofileName;
          load_selected_def_profile();
          highlightSelectedDefProfile(defprofileName);
        }
      }
    });

    dropdownList.appendChild(option);
  }

  // Auto-close the dropdown if no profiles
  if (Object.keys(defprofile_map).length === 0) {
    closeDropdown('def-profile-dropdown-list');
    toggleButton.textContent = 'Select Saved Profile';
  } else {
    toggleButton.style.pointerEvents = 'auto';
    toggleButton.style.opacity = '1';
  }
}

// Function to load selected defender profile from the dropdown
function load_selected_def_profile() {
  let selectedProfile = document.querySelector(
    '#def-profile-dropdown .custom-dropdown-selected',
  ).textContent;

  if (!selectedProfile || selectedProfile === 'Select Saved Profile') {
    alert('Please Select Saved Profile to load.');
    return;
  }

  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  let profile = defprofile_map[selectedProfile];

  if (profile) {
    set_value('t', profile.t);
    set_value('save', profile.save_stat);
    set_value('invulnerable', profile.invuln_stat);
    set_value('save_mod', profile.save_mod);
    set_value('save_reroll', profile.save_reroll);
    set_checked('cover', profile.cover);
    set_value('wounds', profile.wound_val);
    set_value('fnp', profile.fnp);
  } else {
    console.error('Profile not found');
  }
}

// Function to remove the selected defender profile
function remove_def_profile(profileName, event) {
  event.stopPropagation();
  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  delete defprofile_map[profileName];
  localStorage.setItem('def_profile_map', JSON.stringify(defprofile_map));
  update_def_profile_dropdown();
}

// Function to highlight the selected defender profile in blue
function highlightSelectedDefProfile(selectedProfile) {
  let profileItems = document.querySelectorAll(
    '#def-profile-dropdown-list div',
  );
  profileItems.forEach(function (item) {
    item.classList.remove('selected');
    if (
      selectedProfile &&
      item.querySelector('span').textContent === selectedProfile
    ) {
      item.classList.add('selected');
    }
  });
}

// Function to toggle dropdown visibility and save current values if no profile is selected
function toggleDropdown(listId) {
  let list = document.getElementById(listId);
  let selectedText = document.querySelector('#atk-profile-dropdown .custom-dropdown-selected').textContent;

  // Check if the dropdown is opening (i.e., list is currently hidden)
  if (list.style.display !== 'block') {
    // Dropdown is being opened
    
    // Only save current attacker values if no profile is selected
    if (selectedText.trim() === 'Select Saved Profile') {
      saveCurrentAttackerValues(); // Save current values
    }

    // Show the dropdown
    list.style.display = 'block';

  } else {
    // Dropdown is being closed
    list.style.display = 'none'; // Hide the dropdown
  }
}

// Utility functions
function fetch_value(id) {
  let element = document.getElementById(id);
  return element ? element.value : '';
}

function fetch_int_value(id) {
  let element = document.getElementById(id);
  return element ? parseInt(element.value, 10) : 0;
}

function set_value(id, value) {
  let element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

function set_checked(id, isChecked) {
  let element = document.getElementById(id);
  if (element && element.type === 'checkbox') {
    element.checked = isChecked;
  }
}
