function rowClicked(row) {
  const itemName = row.cells[0].textContent; // Get the first cell (Item Name)
  const quantity = row.cells[1].textContent; // Get the second cell (Quantity)
  const stock = row.cells[2].textContent; // Get the third cell (Stock Availability)

  alert(`Item: ${itemName}\nQuantity: ${quantity}\nStock: ${stock}`);
}
