document.addEventListener('DOMContentLoaded', function() {
    // Global array to store all submissions from the server
    let submissionsData = [];
  
    // Select the filter input and container where the table will be rendered
    const filterInput = document.getElementById('filter-input');
    const idFilterInput = document.getElementById('id-filter');
    const lgoFilter = document.getElementById('lgoFilter');
    const container = document.getElementById('table-container');
  
    // Function to build and display the table given an array of submissions
    function renderTable(data) {
      // Clear any existing content in the container
      container.innerHTML = '';
  
      if (!data.length) {
        container.innerHTML = '<p>No submissions found.</p>';
        return;
      }
  
      // Define the explicit column order (with "id" as the first column)
      const columns = ["id", "name", "email", "option", "timestamp"];
  
      // Create the table element and set basic styling
      const table = document.createElement('table');
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';
  
      // Build the table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.style.border = '1px solid #ddd';
        th.style.padding = '10px';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      // Build the table body
      const tbody = document.createElement('tbody');
      data.forEach(submission => {
        const row = document.createElement('tr');
        columns.forEach(col => {
          const td = document.createElement('td');
          td.textContent = submission[col] || '';
          td.style.border = '1px solid #ddd';
          td.style.padding = '10px';
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
  
      // Append the table to the container
      container.appendChild(table);
    }
  
    // Fetch all submissions from the server
    fetch('/submissionsData')
      .then(response => response.json())
      .then(data => {
        submissionsData = data; // Store fetched data globally
        renderTable(submissionsData); // Render initial table with all submissions
      })
      .catch(error => {
        console.error('Error fetching submissions:', error);
      });
  
    // Add an event listener to the filter input to filter the table as the user types
    filterInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
  
      // Filter submissions by matching the 'name' field
      // You can adjust this logic to filter on a different field or multiple fields
      const filteredData = submissionsData.filter(submission => {
        // Check if the submission has a name, and if it includes the search term
        return (
            (submission.name && submission.name.toLowerCase().includes(searchTerm)) ||
            (submission.email && submission.email.toLowerCase().includes(searchTerm))
        );
      });

      // Re-render the table with the filtered data
      renderTable(filteredData);
    });

    idFilterInput.addEventListener('input', function(e) {
        const id = e.target.value.trim();

        // Filter submissions by matching "id" field (conver to string)
        const filteredId = submissionsData.filter(submission => {
            // If the filter is empy includ all submissions
            if (id === '') return true;
            // Otherwise, include only id's user says
            return submission.id.toString().includes(id);
        });
        
        renderTable(filteredId);
    });

    lgoFilter.addEventListener('change', function(e) {
        const selected = e.target.value;

        // If no specific option is selected (empty string), show all submissions.
        // Otherwise, filter the submissions based on the 'options' field.
        const filteredLogos = selected === ''
            ? submissionsData
            : submissionsData.filter(submission => submission.option === selected);
        
        renderTable(filteredLogos)
    });

    lgoFilter.addEventListener('click', function(e) {
        // If the current value is the defualt (empty string)
        if (filteredLogos.value === '') {
            renderTable(submissionsData);
        }
    });

    document.getElementById('signOutBtn').addEventListener('click', function() {
        window.location.href = '/logout';
    });

    document.getElementById('refreshBtn').addEventListener('click', function() {
        location.reload();
    });

     // Add event listener to the "Remove All Submissions" button
    const clearButton = document.getElementById('clearBtn');
    clearButton.addEventListener('click', function() {
      // Prompt the user for the password
      const password = prompt('Enter the password to remove all submissions:');
      if (password === null) {
        // User cancelled the prompt; do nothing.
        return;
      }
      
      // Send a POST request to clear submissions
      fetch('/clearSubmissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) });
        }
        return response.text();
      })
      .then(message => {
        alert(message);
        // Optionally reload the page to update the table
        location.reload();
      })
      .catch(error => {
        alert('Error: ' + error.message);
      });
    });
});
  