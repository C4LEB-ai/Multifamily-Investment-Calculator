let lineChart, barChart;
let investmentCount = 0;

document.addEventListener('DOMContentLoaded', function () {
    const investmentInputs = document.getElementById('investmentInputs');
    const addInvestmentButton = document.getElementById('addInvestmentButton');
    const summaryTableContainer = document.getElementById('summaryTableContainer'); // Ensure this exists

    // Add the first investment field on load
    addInvestmentField();

    // Event listener for "Add Investment" button
    addInvestmentButton.addEventListener('click', addInvestmentField);

    function addInvestmentField() {
        investmentCount++;
        const div = document.createElement('div');
        div.classList.add('investment-form');
        div.innerHTML = `
          <div class="form-group">
            <label for="investmentCapital${investmentCount}">Investment ${investmentCount} Capital ($):</label>
            <input type="number" id="investmentCapital${investmentCount}" placeholder="Enter Amount" max="30" class="investment-capital" required>
          </div>
          <div class="form-group">
            <label for="startYear${investmentCount}">Start Year:</label>
            <input type="number" id="startYear${investmentCount}" placeholder="Enter Start Year, 1,2,..." max="30" class="investment-start-year" required>
          </div>
          <div class="form-group">
            <label for="holdPeriod${investmentCount}">Hold Period (years):</label>
            <input type="number" id="holdPeriod${investmentCount}" placeholder="Enter Hold period" max="30" class="investment-hold-period" required>
          </div>
          <div class="form-group">
            <label for="cashFlow${investmentCount}">Cash Flow (%):</label>
            <input type="number" id="cashFlow${investmentCount}" placeholder="Enter Cashflow 1,2,3..." max="30" class="investment-cashflow" required>
          </div>
          <div class="form-group">
            <label for="appreciation${investmentCount}"> Appreciation (%):</label>
            <input type="number" id="appreciation${investmentCount}" placeholder="Enter Appreciation 1,2,3.." max="30" class="investment-appreciation" required>
          </div>
          <div id="investment${investmentCount}TableContainer"><h2>Investment ${investmentCount} Summary</h2></div>`;
        investmentInputs.appendChild(div);
    }

    // Initialize the charts
    initCharts();

    document.getElementById('calculateButton').addEventListener('click', function () {
        const investmentCapitals = Array.from(document.querySelectorAll('.investment-capital')).map(input => parseFloat(input.value) || 0);
        const startYears = Array.from(document.querySelectorAll('.investment-start-year')).map(input => parseInt(input.value) || 1);
        const holdPeriods = Array.from(document.querySelectorAll('.investment-hold-period')).map(input => parseInt(input.value) || 1);
        const cashFlows = Array.from(document.querySelectorAll('.investment-cashflow')).map(input => parseFloat(input.value) || 0);
        const appreciations = Array.from(document.querySelectorAll('.investment-appreciation')).map(input => parseFloat(input.value) || 0);

        if (investmentCapitals.every(capital => capital === 0)) {
            alert("You must invest in at least one investment opportunity.");
            return;
        }

        let maxYears = Math.max(...startYears.map((start, index) => start + holdPeriods[index]));
        let totalNetWorthData = Array(maxYears).fill(0);
        let totalPassiveIncomeData = Array(maxYears).fill(0);
        let totalAppreciationData = Array(maxYears).fill(0);
        let totalInvestments = investmentCapitals.length;

        const individualNetworths = [];

        // Clear any previous tables
        investmentInputs.querySelectorAll('.investment-table').forEach(table => table.remove());

        let individualInvestmentsData = [];

        // Perform calculations for each investment
        investmentCapitals.forEach((capital, index) => {
            if (capital > 0) {
                const startYear = startYears[index];
                const holdPeriod = holdPeriods[index];
                const cashFlow = cashFlows[index];
                const appreciation = appreciations[index];

                const { netWorthData, netWorth, passiveIncomeData, appreciationData } = calculateInvestmentData(capital, cashFlow, appreciation, startYear, holdPeriod, maxYears);
                individualInvestmentsData.push({ label: `Investment ${index + 1}`, netWorthData });

                createInvestmentTable(index + 1, netWorthData, passiveIncomeData, appreciationData, maxYears);

                for (let i = 0; i < maxYears; i++) {
                    totalNetWorthData[i] += netWorthData[i];
                    totalPassiveIncomeData[i] += passiveIncomeData[i];
                    totalAppreciationData[i] += appreciationData[i];
                }
                individualNetworths.push(netWorth);

            }
        });

        // Calculate totals for the cards
        // const totalNetWorth = totalNetWorthData.reduce((a, b) => a + b, 0).toFixed(2);
        const totalNetWorth = individualNetworths.reduce((a, b) => a + b, 0).toFixed(2);
        const totalPassiveIncome = totalPassiveIncomeData.reduce((a, b) => a + b, 0).toFixed(2);
        const totalAppreciation = totalAppreciationData.reduce((a, b) => a + b, 0).toFixed(2);

        // Update cards
        document.getElementById('totalNetWorth').innerText = `$${totalNetWorth}`;
        document.getElementById('totalPassiveIncome').innerText = `$${totalPassiveIncome}`;
        document.getElementById('totalAppreciation').innerText = `$${totalAppreciation}`;
        document.getElementById('totalInvestments').innerText = totalInvestments;

        // Update charts
        updateCharts(totalNetWorthData, totalPassiveIncomeData, totalAppreciationData, individualInvestmentsData, maxYears);

        // Create the investment summary table
        createInvestmentSummaryTable(totalNetWorthData, totalAppreciationData, totalPassiveIncomeData, investmentCapitals, startYears, holdPeriods, maxYears);
    });

    function createInvestmentSummaryTable(totalNetWorthData, totalAppreciationData, totalPassiveIncomeData, investmentCapitals, startYears, holdPeriods, maxYears) {
        // Clear any existing summary table before creating a new one
        const existingTable = document.querySelector('.summary-table');
        if (existingTable) {
            existingTable.remove();  // Remove the previous table
        }

        const years = Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);

        const table = document.createElement('table');
        table.classList.add('summary-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Year</th>
                    <th>Capital Invested ($)</th>
                    <th>Appreciation ($)</th>
                    <th>Cash Flow ($)</th>
                    <th>Net Worth ($)</th>
                </tr>
            </thead>
            <tbody>
                ${years.map((year, index) => {
            // For each year, calculate the capital invested only for the specific start year of each investment
            let capitalInvested = 0;
            investmentCapitals.forEach((capital, i) => {
                if (index + 1 === startYears[i]) {  // Only add capital for the start year
                    capitalInvested += capital;
                }
            });

            // Ensure data ends at the last year of the investments (startYear + holdPeriod)
            return `
                        <tr>
                            <td>${year}</td>
                            <td>${capitalInvested.toFixed(2)}</td>
                            <td>${totalAppreciationData[index].toFixed(2)}</td>
                            <td>${totalPassiveIncomeData[index].toFixed(2)}</td>
                            <td>${totalNetWorthData[index].toFixed(2)}</td>
                        </tr>
                    `;
        }).join('')}
            </tbody>
        `;
        summaryTableContainer.appendChild(table);
    }


    function calculateInvestmentData(capitalInvested, cashFlow, appreciation, startYear, holdPeriod, maxYears) {
        let netWorthData = Array(maxYears).fill(0);
        let passiveIncomeData = Array(maxYears).fill(0);
        let appreciationData = Array(maxYears).fill(0);
        let netWorth = capitalInvested;
        let totalAppreciation = 0;

        for (let year = startYear; year < startYear + holdPeriod && year <= maxYears; year++) {
            const passiveIncome = capitalInvested * (cashFlow / 100);
            const yearlyAppreciation = capitalInvested * (appreciation / 100);
            netWorth += passiveIncome;

            const index = year - 1;
            netWorthData[index] = netWorth;
            passiveIncomeData[index] = passiveIncome;
            appreciationData[index] = yearlyAppreciation;


            totalAppreciation += yearlyAppreciation;
        }

        if (startYear + holdPeriod - 1 < maxYears) {
            const finalYearIndex = startYear + holdPeriod - 2;
            netWorthData[finalYearIndex] += totalAppreciation;
            netWorth += totalAppreciation;
        }

        // return { netWorthData, passiveIncomeData, appreciationData };
        return { netWorthData, passiveIncomeData, appreciationData, netWorth };
    }

    function createInvestmentTable(investmentNumber, netWorthData, passiveIncomeData, appreciationData, maxYears) {
        const container = document.getElementById(`investment${investmentNumber}TableContainer`);
        const table = document.createElement('table');
        table.classList.add('investment-table');
        const years = Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Year</th>
                    <th>Net Worth ($)</th>
                    <th>Passive Income ($)</th>
                    <th>Appreciation ($)</th>
                </tr>
            </thead>
            <tbody>
                ${years.map((year, index) => `
                    <tr>
                        <td>${year}</td>
                        <td>${netWorthData[index].toFixed(2)}</td>
                        <td>${passiveIncomeData[index].toFixed(2)}</td>
                        <td>${appreciationData[index].toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    }

    // Initialize line and bar charts
    function initCharts() {
        lineChart = new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Net Worth',
                    data: [],
                    borderColor: '#6a0dad',
                    backgroundColor: 'rgba(106, 13, 173, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
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

        barChart = new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Passive Income',
                        data: [],
                        backgroundColor: '#4CAF50'
                    },
                    {
                        label: 'Appreciation',
                        data: [],
                        backgroundColor: '#B5D920'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true
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
    }

    // Function to update both charts
    function updateCharts(totalNetWorthData, totalPassiveIncomeData, totalAppreciationData, individualInvestmentsData, maxYears) {
        const years = Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);

        // Update line chart for total net worth and individual investments
        lineChart.data.labels = years;
        lineChart.data.datasets = [
            {
                label: 'Total Net Worth',
                data: totalNetWorthData,
                borderColor: '#6a0dad',
                backgroundColor: 'rgba(106, 13, 173, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            },
            ...individualInvestmentsData.map((investment, index) => ({
                label: investment.label,
                data: investment.netWorthData,
                borderColor: getRandomColor(),
                fill: false,
                tension: 0.4
            }))
        ];
        lineChart.update();

        // Update bar chart for passive income and appreciation
        barChart.data.labels = years;
        barChart.data.datasets[0].data = totalPassiveIncomeData;
        barChart.data.datasets[1].data = totalAppreciationData;
        barChart.update();
    }

    // Function to generate a random color for each investment line
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
