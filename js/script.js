// Sample data for the usage chart
const data = {
    labels: ['Tissue Paper', 'Pen', 'Books', 'Marker', 'Spray', 'Sharpener', 'Stapler', 'Pin'],
    datasets: [{
        label: 'Usage',
        data: [80, 40, 40, 40, 40, 40, 30, 70],
        backgroundColor: function(context) {
            const value = context.raw; // Get the data value of the current bar
            if (value >= 70) {
                return 'rgba(0, 102, 0, 0.7)'; // Bold green for high usage
            } else if (value >= 50) {
                return 'rgba(255, 87, 34, 0.7)'; // Bold orange for medium usage
            } else {
                return 'rgba(211, 47, 47, 0.7)'; // Bold red for low usage
            }
        },
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
        responsive: true, // Make the chart responsive
        plugins: {
            tooltip: {
                enabled: true, // Enable tooltips
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.dataset.label + ': ' + tooltipItem.raw + '%'; // Add percentage to tooltip
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true, // Start y-axis from zero
                ticks: {
                    callback: function(value) {
                        return value + '%'; // Add percentage symbol to y-axis labels
                    }
                }
            },
            x: {
                ticks: {
                    autoSkip: false, // Avoid skipping labels on the x-axis
                    maxRotation: 45, // Rotate labels for better readability
                    minRotation: 45
                }
            }
        },
        animation: {
            duration: 1500, // Set animation duration for smooth transitions
            easing: 'easeInOutQuart' // Add easing effect for smooth animations
        },
        legend: {
            display: true, // Display legend
            position: 'top', // Position the legend at the top
            labels: {
                boxWidth: 10, // Set size of legend boxes
                padding: 20 // Add padding to legend items
            }
        }
    }
});
