let lineChart, barChart;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Line Chart
    lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: [], // Year labels
            datasets: [{
                label: 'Net Worth',
                data: [], // Net worth values
                borderColor: '#6a0dad',
                backgroundColor: 'rgba(106, 13, 173, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4 // Slight curve to the lines
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Years'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Net Worth ($)'
                    }
                }
            }
        }
    });

    // Initialize Bar Chart
    barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: [], // Year labels
            datasets: [
                {
                    label: 'Passive Income',
                    data: [],
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Appreciation',
                    data: [],
                    backgroundColor: '#FFC107'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
});

document.getElementById('calculateButton').addEventListener('click', function() {
    // Retrieve user inputs
    const amountInvested = parseFloat(document.getElementById('amountInvested').value);
    const investmentPeriod = parseInt(document.getElementById('investmentPeriod').value);
    const cashFlow = parseFloat(document.getElementById('cashFlow').value);
    const appreciation = parseFloat(document.getElementById('appreciation').value);

    // Validate inputs
    if (investmentPeriod > 30 || cashFlow > 100 || appreciation > 100) {
        alert("Investment Period must be 30 or less, Cashflow and Appreciation must be 100% or less.");
        return;
    }

    let netWorth = amountInvested;
    let capitalInvested = amountInvested;
    let totalAppreciation = 0;

    // Clear previous results from the table
    const resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = '';

    // Arrays to store chart data
    const years = [];
    const netWorthData = [];
    const passiveIncomeData = [];
    const appreciationData = [];

    // Loop through each year to calculate values
    for (let year = 1; year <= investmentPeriod; year++) {
        const passiveIncome = capitalInvested * (cashFlow / 100);
        const yearlyAppreciation = capitalInvested * (appreciation / 100);
        netWorth += passiveIncome;
        totalAppreciation += yearlyAppreciation;

        // Populate table with data for each year
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Year ${year}</td>
            <td>$${(netWorth - passiveIncome).toFixed(2)}</td>
            <td>$${capitalInvested.toFixed(2)}</td>
            <td>$${passiveIncome.toFixed(2)}</td>
            <td>$${yearlyAppreciation.toFixed(2)}</td>
            <td>$${(netWorth + (year === investmentPeriod ? totalAppreciation : 0)).toFixed(2)}</td>
        `;
        resultTableBody.appendChild(row);

        // Populate data for charts
        years.push(`Year ${year}`);
        netWorthData.push(netWorth.toFixed(2));
        passiveIncomeData.push(passiveIncome.toFixed(2));
        appreciationData.push(yearlyAppreciation.toFixed(2));
    }

    // Update Line Chart with new data
    lineChart.data.labels = years;
    lineChart.data.datasets[0].data = netWorthData;
    lineChart.update();

    // Update Bar Chart with new data
    barChart.data.labels = years;
    barChart.data.datasets[0].data = passiveIncomeData;
    barChart.data.datasets[1].data = appreciationData;
    barChart.update();
});