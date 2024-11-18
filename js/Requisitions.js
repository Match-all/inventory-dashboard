// Handle Approve/Reject actions
function handleRequisition(action) {
  if (action === 'approve') {
      alert('Requisition Approved!');
  } else if (action === 'reject') {
      alert('Requisition Rejected!');
  }
}

// Delete Row
function deleteRow(button) {
  const row = button.parentElement.parentElement; // Get the <tr> of the button
  row.remove(); // Remove the <tr> element
  alert('Row Deleted!');
}

// Add New Row
function addRow() {
  const table = document.getElementById('order-table');
  const itemName = document.getElementById('item-name').value;
  const itemQuantity = document.getElementById('item-quantity').value;
  const itemStock = document.getElementById('item-stock').value;

  if (!itemName || !itemQuantity || !itemStock) {
      alert('Please fill out all fields!');
      return;
  }

  const newRow = table.insertRow();
  newRow.innerHTML = `
      <td contenteditable="true">${itemName}</td>
      <td contenteditable="true">${itemQuantity}</td>
      <td>${itemStock}</td>
      <td><button class="delete-btn" onclick="deleteRow(this)">🗑️</button></td>
  `;

  alert('Item Added Successfully!');
  // Clear input fields
  document.getElementById('item-name').value = '';
  document.getElementById('item-quantity').value = '';
  document.getElementById('item-stock').value = '';
}

// Filter Table
function filterTable() {
  const searchValue = document.getElementById('search-bar').value.toLowerCase();
  const rows = document.querySelectorAll('#order-table tr');

  rows.forEach(row => {
      const itemName = row.cells[0].textContent.toLowerCase();
      row.style.display = itemName.includes(searchValue) ? '' : 'none';
  });
}

// Validate Stock Availability
document.addEventListener('input', function (e) {
  if (e.target && e.target.cellIndex === 1) {
      const row = e.target.parentElement;
      const requestedQuantity = parseInt(e.target.textContent);
      const availableStock = parseInt(row.cells[2].textContent);

      if (requestedQuantity > availableStock) {
          alert('Requested quantity exceeds available stock!');
          e.target.textContent = availableStock; // Reset to stock limit
      }
  }
});
