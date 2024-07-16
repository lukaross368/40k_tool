document.addEventListener("DOMContentLoaded", function() {
  const fileListContainer = document.getElementById('file-list-container');

  // Function to fetch file names from local directory
  function fetchFiles() {
      const directoryPath = './wh40k-10e/';

      console.log(`Navigating to directory: ${directoryPath}`);

      fetch(directoryPath)
          .then(response => response.text())
          .then(data => {
              console.log('Fetched directory listing:', data);

              // Extract file names from directory listing
              const parser = new DOMParser();
              const htmlDoc = parser.parseFromString(data, 'text/html');
              const fileLinks = Array.from(htmlDoc.querySelectorAll('a'))
                  .map(link => link.getAttribute('href').split('/').pop())
                  .filter(fileName => fileName !== '..' && fileName !== '.' && fileName !== '');

              console.log('Extracted file names:', fileLinks);

              displayFileList(fileLinks);
          })
          .catch(error => console.error('Error fetching files:', error));
  }

  // Function to display file names in the HTML
  function displayFileList(fileArray) {
      const fileList = document.createElement('ul');
      fileArray.forEach(file => {
          const listItem = document.createElement('li');
          listItem.textContent = file;
          fileList.appendChild(listItem);
      });

      // Append the list to the container in HTML
      fileListContainer.appendChild(fileList);
  }

  // Initial fetch of files when the page loads
  fetchFiles();
});
