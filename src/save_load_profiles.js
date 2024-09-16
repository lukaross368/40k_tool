//////////////////////////////////////////////////////////////////////////////////////////
// Attacker save profiles
//////////////////////////////////////////////////////////////////////////////////////////

// Function to save the attacker profile
function save_atk_profile() {
  // Fetching all required values from the attacker container
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
  let cover = is_checked('cover');
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
    cover: cover,
    damage_val: damage_val,
  };

  // Get the profile name from input field
  var atkprofileName = document.getElementById('atksaveprofile').value;

  if (!atkprofileName) {
    alert('Please enter a profile name.');
    return;
  }

  // Clear the input field after saving
  document.getElementById('atksaveprofile').value = '';

  // Append profile name and data to localStorage
  let atkprofile_map =
    JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  atkprofile_map[atkprofileName] = atk_profile;
  localStorage.setItem('atk_profile_map', JSON.stringify(atkprofile_map));

  // Refresh the dropdown with new profile
  update_atk_profile_dropdown();
}

// Function to update the dropdown with saved profiles
function update_atk_profile_dropdown() {
  let atkprofile_map =
    JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  let atkprofileDropdown = document.getElementById('atk-profile-dropdown');

  // Clear existing options
  atkprofileDropdown.innerHTML = '<option value="">Select a profile</option>';

  // Populate dropdown with profiles
  for (let atkprofileName in atkprofile_map) {
    let option = document.createElement('option');
    option.value = atkprofileName;
    option.textContent = atkprofileName;
    atkprofileDropdown.appendChild(option);
  }
}

// Function to load selected profile from the dropdown
function load_selected_atk_profile() {
  let selectedProfile = document.getElementById('atk-profile-dropdown').value;

  if (!selectedProfile) {
    alert('Please select a profile to load.');
    return;
  }

  let atkprofile_map =
    JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  let profile = atkprofile_map[selectedProfile];

  if (profile) {
    // Populate fields with the loaded profile values
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
    set_checked('cover', profile.cover);
    set_value('d', profile.damage_val);
  } else {
    console.error('Profile not found');
  }
}

// Function to remove the selected profile from localStorage
function remove_selected_atk_profile() {
  let selectedProfile = document.getElementById('atk-profile-dropdown').value;

  if (!selectedProfile) {
    alert('Please select a profile to remove.');
    return;
  }

  let atkprofile_map =
    JSON.parse(localStorage.getItem('atk_profile_map')) || {};
  delete atkprofile_map[selectedProfile];
  localStorage.setItem('atk_profile_map', JSON.stringify(atkprofile_map));

  // Refresh the dropdown after removing the profile
  update_atk_profile_dropdown();
}

//////////////////////////////////////////////////////////////////////////////////////////
// Defender save profiles
//////////////////////////////////////////////////////////////////////////////////////////

// Function to save the defender profile
function save_def_profile() {
  // Fetching all required values from the defender container
  let t = fetch_int_value('t');
  let save_stat = fetch_int_value('save');
  let invuln_stat = fetch_int_value('invulnerable');
  let save_mod = fetch_int_value('save_mod');
  let save_reroll = fetch_value('save_reroll');
  let wound_val = fetch_int_value('wounds');
  let fnp = fetch_int_value('fnp');

  let def_profile = {
    t: t,
    save_stat: save_stat,
    invuln_stat: invuln_stat,
    save_mod: save_mod,
    save_reroll: save_reroll,
    wound_val: wound_val,
    fnp: fnp,
  };

  // Get the profile name from input field
  var defprofileName = document.getElementById('defsaveprofile').value;

  if (!defprofileName) {
    alert('Please enter a profile name.');
    return;
  }

  // Clear the input field after saving
  document.getElementById('defsaveprofile').value = '';

  // Append profile name and data to localStorage
  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  defprofile_map[defprofileName] = def_profile;
  localStorage.setItem('def_profile_map', JSON.stringify(defprofile_map));

  // Refresh the dropdown with new profile
  update_def_profile_dropdown();
}

// Function to update the dropdown with saved profiles
function update_def_profile_dropdown() {
  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  let defprofileDropdown = document.getElementById('def-profile-dropdown');

  // Clear existing options
  defprofileDropdown.innerHTML = '<option value="">Select a profile</option>';

  // Populate dropdown with profiles
  for (let defprofileName in defprofile_map) {
    let option = document.createElement('option');
    option.value = defprofileName;
    option.textContent = defprofileName;
    defprofileDropdown.appendChild(option);
  }
}

// Function to load selected profile from the dropdown
function load_selected_def_profile() {
  let selectedProfile = document.getElementById('def-profile-dropdown').value;

  if (!selectedProfile) {
    alert('Please select a profile to load.');
    return;
  }

  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  let profile = defprofile_map[selectedProfile];

  if (profile) {
    // Populate fields with the loaded profile values
    set_value('t', profile.t);
    set_value('save', profile.save_stat);
    set_value('invulnerable', profile.invuln_stat);
    set_value('save_mod', profile.save_mod);
    set_value('save_reroll', profile.save_reroll);
    set_value('wounds', profile.wound_val);
    set_value('fnp', profile.fnp);
  } else {
    console.error('Profile not found');
  }
}

// Function to remove the selected profile from localStorage
function remove_selected_def_profile() {
  let selectedProfile = document.getElementById('def-profile-dropdown').value;

  if (!selectedProfile) {
    alert('Please select a profile to remove.');
    return;
  }

  let defprofile_map =
    JSON.parse(localStorage.getItem('def_profile_map')) || {};
  delete defprofile_map[selectedProfile];
  localStorage.setItem('def_profile_map', JSON.stringify(defprofile_map));

  // Refresh the dropdown after removing the profile
  update_def_profile_dropdown();
}

// Utility function to set values of input fields
function set_value(id, value) {
  let element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

// Utility function to set checked status for checkboxes
function set_checked(id, isChecked) {
  let element = document.getElementById(id);
  if (element && element.type === 'checkbox') {
    element.checked = isChecked;
  }
}
