document.addEventListener('DOMContentLoaded', function() {
    // Fetch the login history data from server
    fetch('/loginHistoryData')
        .then(response => response.json())
        .then(data => {
          const container = document.getElementById('login-history-container');
          container.innerHTML = '';
          if (!data.length) {
            container.innerHTML = '<p>No login records found.</p>';
            return;
          }

          // Create a table to display login history
          const table = document.createElement('table');

          // Define the colums you want to show
          const colums = ['username', 'time', 'ip'];

          // Build header row
          const thead = document.createElement('thead');
          const headerRow = document.createElement('tr');
          colums.forEach(col => {
            const th = document.createElement('th');
            headerRow.appendChild('th');
          });
          thead.appendChild(headerRow);
          table.appendChild(thead);

          // Build table body
          const tbody = document.createElement('tbody');
          data.forEach(record => {
            const row = document.createElement('tr');
            colums.forEach(col => {
                const td = document.createElement('td');
                row.appendChild(td);
            });
            tbody.appendChild(row);
          });
          table.appendChild(tbody);

          container.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching login history:', error);
        });
});