// Delete a row from the table
function deleteRow(button) {
  var row = button.parentNode.parentNode;
  row.parentNode.removeChild(row);
}

// Handle requisitions
function handleRequisition(action) {
  if (action === 'approve') {
      alert('Requisition Approved');
  } else if (action === 'reject') {
      alert('Requisition Rejected');
  }
}
