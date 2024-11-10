// Sample data for the usage chart
const data = {
  labels: ['Tissue Paper', 'Pen', 'Books', 'Marker', 'Spray', 'Sharpner', 'Stepler', 'Pin'],
  datasets: [{
      label: 'Usage',
      data: [80, 40, 40, 40, 40, 40, 30, 70],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
  }]
};

// Create the chart
const ctx = document.getElementById('usage-chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'bar',
  data: data,
  options: {
      scales: {
          y: {
              beginAtZero: true
          }
      }
  }
});

