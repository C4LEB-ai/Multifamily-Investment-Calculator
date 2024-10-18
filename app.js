let lineChart, barChart;
let investmentCount = 0;

document.addEventListener('DOMContentLoaded', function () {
    const investmentInputs = document.getElementById('investmentInputs');
    const addInvestmentButton = document.getElementById('addInvestmentButton');
    const summaryTableContainer = document.getElementById('summaryTableContainer');

    // Add the first investment field on load
    addInvestmentField();
    function getOrdinalInvestmentLabel(investmentNumber) {
        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth'];
        return ordinals[investmentNumber - 1] + ' Investment'; // Adjusting for 0-based index
    }

    // Event listener for "Add Investment" button
    addInvestmentButton.addEventListener('click', addInvestmentField);

    function addInvestmentField() {
        investmentCount++;
        const ordinalLabel = getOrdinalInvestmentLabel(investmentCount);
        
        const div = document.createElement('div');
        div.classList.add('investment-form');
        div.innerHTML = `
          <div class="form-group">
            <label for="investmentCapital${investmentCount}" style="color: #6a0dad; font-weight: bold;">${ordinalLabel} Capital ($):</label>
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
            <label for="cashFlow${investmentCount}">Cash Flow (5-8%):</label>
            <input type="number" id="cashFlow${investmentCount}" placeholder="Enter Cashflow 1,2,3..." max="30" class="investment-cashflow" required>
          </div>
          <div class="form-group">
            <label for="appreciation${investmentCount}">Appreciation (10-20%):</label>
            <input type="number" id="appreciation${investmentCount}" placeholder="Enter Appreciation 1,2,3.." max="30" class="investment-appreciation" required>
          </div>
          <div>
          </div>`;
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
        let totalInvested = 0; 

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
                totalInvested += capital;

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
        
        const totalNetWorth = individualNetworths.reduce((a, b) => a + b, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const totalAppreciation = totalAppreciationData.reduce((a, b) => a + b, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const totalPassiveIncome = (totalPassiveIncomeData.reduce((a, b) => a + b, 0)+totalAppreciationData.reduce((a, b) => a + b, 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        // Update cards
        document.getElementById('totalNetWorth').innerText = `${totalNetWorth}`;
        document.getElementById('totalPassiveIncome').innerText = `${totalPassiveIncome}`;
        document.getElementById('totalAppreciation').innerText = `${totalAppreciation}`;
        document.getElementById('Invested').innerText = totalInvested.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        document.getElementById('cashflow').innerText = (totalPassiveIncomeData.reduce((a, b) => a + b, 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        document.getElementById('totalInvestments').innerText = totalInvestments;

        // Update charts
        updateCharts(totalNetWorthData, totalPassiveIncomeData, totalAppreciationData, individualInvestmentsData, maxYears);

        // Create the investment summary table
        createInvestmentSummaryTable(totalNetWorthData, totalAppreciationData, totalPassiveIncomeData, investmentCapitals, startYears, holdPeriods, maxYears);
    });


    function getOrdinalInvestmentLabel(investmentNumber) {
        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth'];
        return ordinals[investmentNumber - 1] + ' Investment'; // Adjusting for 0-based index
    }


    function createInvestmentSummaryTable(totalNetWorthData, totalAppreciationData, totalPassiveIncomeData, investmentCapitals, startYears, holdPeriods, maxYears) {
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
                    let capitalInvested = 0;
                    investmentCapitals.forEach((capital, i) => {
                        if (index + 1 === startYears[i]) {
                            capitalInvested += capital;
                        }
                    });
    
                    // Only create rows where there's non-zero data
                    if (capitalInvested || totalAppreciationData[index] || totalPassiveIncomeData[index] || totalNetWorthData[index]) {
                        return `
                            <tr>
                                <td>${year}</td>
                                <td>${capitalInvested.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td>${totalAppreciationData[index].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td>${totalPassiveIncomeData[index].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td>${totalNetWorthData[index].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            </tr>
                        `;
                    }
                    return ''; // Return an empty string for years with no data
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

        // refresh page
    document.getElementById('clearButton').addEventListener('click', function () {
        location.reload();
    });

    function createInvestmentTable(investmentNumber, netWorthData, passiveIncomeData, appreciationData, maxYears) {
        const ordinalLabel = getOrdinalInvestmentLabel(investmentNumber);
        const container = document.getElementById('summaryTablContainer'); // Middle grid container
    
        // Clear any previous table specific to this investment
        const existingTable = container.querySelector(`.investment-table-${investmentNumber}`);
        const existingTitle = container.querySelector(`.investment-title-${investmentNumber}`);
        
        if (existingTable) {
            existingTable.remove();
        }
        
        if (existingTitle) {
            existingTitle.remove();
        }
    
        // Create a new table and give it a unique class for this investment
        const table = document.createElement('table');
        table.classList.add('investment-table', `investment-table-${investmentNumber}`); // Unique class for each investment
        const years = Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);
    
        // Create a table header with the ordinal label for the investment
        const tableTitle = document.createElement('h2');
        tableTitle.classList.add(`investment-title-${investmentNumber}`);
        tableTitle.textContent = `${ordinalLabel} Summary`;
        
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
                ${years.map((year, index) => {
                    if (netWorthData[index] || passiveIncomeData[index] || appreciationData[index]) {
                        return `
                            <tr>
                                <td>${year}</td>
                                <td>${netWorthData[index].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td>${passiveIncomeData[index].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td>${appreciationData[index].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            </tr>
                        `;
                    }
                    return '';
                }).join('')}
            </tbody>
        `;
    
        // Append the title and table to the middle grid container
        container.appendChild(tableTitle); // Add the title
        container.appendChild(table); // Add the table
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
    // Determine the last index with valid data for total net worth
        const lastIndex = totalNetWorthData.findIndex(value => value === 0) > -1 
            ? totalNetWorthData.findIndex(value => value === 0) - 1 
            : totalNetWorthData.length - 1;

        // Use only the years and data up to the last index with valid data
        const relevantYears = years.slice(0, lastIndex + 1);
        const relevantTotalNetWorthData = totalNetWorthData.slice(0, lastIndex + 1);
        const relevantTotalPassiveIncomeData = totalPassiveIncomeData.slice(0, lastIndex + 1);
        const relevantTotalAppreciationData = totalAppreciationData.slice(0, lastIndex + 1);

        lineChart.data.labels = relevantYears;
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
                label: getOrdinalInvestmentLabel(index + 1), // Use ordinal labels
                data: investment.netWorthData,
                borderColor: getRandomColor(),
                fill: false,
                tension: 0.4
            }))
        ];
        lineChart.update();

        // Update bar chart for passive income and appreciation
        barChart.data.labels = relevantYears;
        barChart.data.datasets[0].data = relevantTotalPassiveIncomeData;
        barChart.data.datasets[1].data = relevantTotalAppreciationData;
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
