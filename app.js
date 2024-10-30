let lineChart, barChart;
let investmentCount = 0;
let val = 0;

document.addEventListener('DOMContentLoaded', function () {
    const investmentInputs = document.getElementById('investmentInputs');
    const addInvestmentButton = document.getElementById('addInvestmentButton');
    const summaryTableContainer = document.getElementById('summaryTableContainer');
    const downloadButton = document.getElementById('download');
    if (downloadButton) {

        downloadButton.addEventListener('click', function () {
            if (val > 0) {
            // Define the entire document body to convert to PDF
            const element = document.body;

            if (element) {
                const options = {
                    margin: 0,
                    filename: 'Your-Investment_Summary.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 3, 
                        useCORS: true,
                        scrollX: 0,
                        scrollY: 0,
                        // Use getBoundingClientRect to get the precise width and height
                        width: element.getBoundingClientRect().width,
                        height: element.getBoundingClientRect().height,
                    },
                    jsPDF: {
                        unit: 'px',
                        format: [element.offsetWidth, element.scrollHeight], // Use scrollHeight instead of offsetHeight
                        orientation: 'portrait'
                    }
                };

                html2pdf().from(element).set(options).save();

            } else {
                console.error('Element to convert to PDF not found!');
            }}
        });
    } else {
        console.error('Download PDF button not found!');
    }
    // Add the first investment field on load
    addInvestmentField();
    function getOrdinalInvestmentLabel(investmentNumber) {
        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth'];
        return ordinals[investmentNumber - 2] + ' Investment'; // Adjusting for 0-based index
    }

    // Event listener for "Add Investment" button
    addInvestmentButton.addEventListener('click',()=>{
        const investmentCapitals = Array.from(document.querySelectorAll('.investment-capital')).map(input => parseFloat(input.value) || 0);
        const startYears = Array.from(document.querySelectorAll('.investment-start-year')).map(input => parseInt(input.value) || 1);
        const holdPeriods = Array.from(document.querySelectorAll('.investment-hold-period')).map(input => parseInt(input.value) || 1);
        const cashFlows = Array.from(document.querySelectorAll('.investment-cashflow')).map(input => parseFloat(input.value) || 0);
        const appreciations = Array.from(document.querySelectorAll('.investment-appreciation')).map(input => parseFloat(input.value) || 0);

        if (investmentCapitals.every(capital => capital === 0)) {
            alert("Investment fields can't be empty.");
            return;
        }

        addInvestmentField()
    }
    );



    function addInvestmentField() {
        investmentCount++;
        const ordinalLabel = getOrdinalInvestmentLabel(investmentCount);

        const div = document.createElement('div');
        div.classList.add('investment-form');
        div.innerHTML = `
        <div class="form-group">
          <label for="investmentCapital${investmentCount}" style="color: #D2B383; font-weight: bold;">${ordinalLabel} Amount ($):</label>
          <input type="text" id="investmentCapital${investmentCount}" placeholder="Enter Amount" pattern="\\d*" class="investment-capital" required>
          <small><em style="font-size: 0.85em;">Please enter your first investment amount <br>(You can add multiple investments below to see your growth over time)</em></small>
        </div>
        <div class="form-group">
          <label for="startYear${investmentCount}" style="font-weight: bold;">Year of Investment:</label>
          <input type="text" id="startYear${investmentCount}" placeholder="Enter Start Year, 1,2,..." pattern="\\d*" class="investment-start-year" required>
          <small><em style="font-size: 0.85em;">Reflects the year in which the investment was made. <br>Applicable if you invest in multiple assets over the years. <br>Example, $50k in year 1 and $50k in year 2. Use “1” if you are calculating one investment only</em></small>
        </div>
        <div class="form-group">
          <label for="holdPeriod${investmentCount}" style="font-weight: bold;">Hold Period (years):</label>
          <input type="text" id="holdPeriod${investmentCount}" placeholder="Enter Hold period" pattern="\\d*" class="investment-hold-period" required>
          <small><em style="font-size: 0.85em;">Investments have a typical 5-year hold period</em></small>
        </div>
        <div class="form-group">
          <label for="cashFlow${investmentCount}" style="font-weight: bold;">Cash Flow (5-8%):</label>
          <input type="text" id="cashFlow${investmentCount}" placeholder="Enter Cashflow 1,2,3..." pattern="\\d*" class="investment-cashflow" required>
          <small><em style="font-size: 0.85em;">Average cash flow is 6%, calculated annually. Also called preferred rate of return</em></small>
        </div>
        <div class="form-group">
          <label for="appreciation${investmentCount}" style="font-weight: bold;">Appreciation (10-20%):</label>
          <input type="text" id="appreciation${investmentCount}" placeholder="Enter Appreciation 1,2,3.." pattern="\\d*" class="investment-appreciation" required>
          <small><em style="font-size: 0.85em;">Indicates the total appreciation of the asset</em></small>
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
        val++;

        let maxYears = Math.max(...startYears.map((start, index) => start + holdPeriods[index]));
        let totalNetWorthData = Array(maxYears).fill(0);
        let totalPassiveIncomeData = Array(maxYears).fill(0);
        let totalAppreciationData = Array(maxYears).fill(0);
        let totalInvestments = investmentCapitals.length;

        let totNetWorth = [];

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
                const carryOver = getCarryOverValue(netWorthData);

                individualInvestmentsData.push({ label: `Investment ${index + 1}`, netWorthData });

                createInvestmentTable(index + 1, netWorthData, passiveIncomeData, appreciationData, maxYears);
                for (let i = 0; i < maxYears - 1; i++) {
                    // if (i > 0) {
                    //     totalNetWorthData[i] += netWorthData[i];
                    // } else {
                    //     totalNetWorthData[i] += netWorthData[i];
                    // }
                    if (i >= holdPeriod + startYear - 1) {
                        totalNetWorthData[i] += netWorthData[i] + carryOver;
                    } else {
                        totalNetWorthData[i] += netWorthData[i];
                    }


                    totalPassiveIncomeData[i] += passiveIncomeData[i];
                    totalAppreciationData[i] += appreciationData[i];
                }

                individualNetworths.push(netWorth);

            }
        });

        // Calculate totals for the cards

        const totalNetWorth = individualNetworths.reduce((a, b) => a + b, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const totalAppreciation = totalAppreciationData.reduce((a, b) => a + b, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const totalPassiveIncome = (totalPassiveIncomeData.reduce((a, b) => a + b, 0) + totalAppreciationData.reduce((a, b) => a + b, 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

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

    function getCarryOverValue(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] !== 0) {
                return arr[i];
            }
        }
        return 0;
    }


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

        // Add appreciation at the end of the holding period
        if (startYear + holdPeriod - 1 < maxYears) {
            const finalYearIndex = startYear + holdPeriod - 2;
            netWorthData[finalYearIndex] += totalAppreciation;
            netWorth += totalAppreciation;
        }

        return { netWorthData, passiveIncomeData, appreciationData, netWorth };
    }

    // Function to update total investment data across multiple investments
    function updateTotalNetWorthData(investments, maxYears) {
        let totalNetWorthData = Array(maxYears).fill(0);
        let previousTotalNetWorth = 0; // Track the cumulative net worth from previous investments

        investments.forEach(investment => {
            const { capitalInvested, cashFlow, appreciation, startYear, holdPeriod } = investment;

            // Calculate the individual investment data
            const { netWorthData, netWorth } = calculateInvestmentData(
                capitalInvested,
                cashFlow,
                appreciation,
                startYear,
                holdPeriod,
                maxYears
            );

            // Update the total net worth by adding the previous total net worth to the current net worth data
            for (let year = startYear - 1; year < maxYears; year++) {
                if (year >= 0) {
                    // Add the previous total net worth to the current investment's net worth data
                    totalNetWorthData[year] = netWorthData[year] + previousTotalNetWorth;
                }
            }

            // Update the previous total net worth to the latest net worth at the end of the investment
            previousTotalNetWorth += netWorth;
        });

        return totalNetWorthData;
    }

    // funtion to refresh the entire page
    document.getElementById('clear').addEventListener('click', function () {
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
                    <th>Ending Net Worth($)</th>
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
                        },
                            ticks: {
                                color:  '#ffffff'
                            }
                        
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Net Worth ($)'
                        },
                        ticks: {
                            color:  '#ffffff'
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
                        stacked: true,
                        ticks: {
                            color:  '#ffffff'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        },
                            ticks: {
                                color:  '#ffffff'
                            }
                        
                    }
                }
            }
        });
    }

    // Function to update the charts with the correct filtering logic
    function updateCharts(totalNetWorthData, totalPassiveIncomeData, totalAppreciationData, individualInvestmentsData, maxYears) {
        const years = Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);

        // Filter total net worth data to exclude zero values
        const filteredNetWorthData = totalNetWorthData.filter(value => value > 0);
        const filteredYears = years.filter((_, index) => totalNetWorthData[index] > 0);

        // Filter individual investment data to start from the first non-zero value
        const filteredIndividualInvestmentsData = individualInvestmentsData.map(investment => {
            const nonZeroIndex = investment.netWorthData.findIndex(value => value > 0);
            const filteredData = investment.netWorthData.slice(nonZeroIndex).filter(value => value > 0);

            // Create an array of nulls up to the nonZeroIndex to align with the years
            const adjustedData = Array(nonZeroIndex).fill(null).concat(filteredData);

            return {
                label: investment.label,
                netWorthData: adjustedData
            };
        });

        // Update line chart with the filtered data
        lineChart.data.labels = filteredYears;
        lineChart.data.datasets = [
            {
                label: 'Total Net Worth',
                data: filteredNetWorthData,
                borderColor: '#6a0dad',
                backgroundColor: 'rgba(106, 13, 173, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            },
            ...filteredIndividualInvestmentsData.map((investment, index) => ({
                label: getOrdinalInvestmentLabel(index + 1),
                data: investment.netWorthData,
                borderColor: getRandomColor(),
                fill: false,
                tension: 0.4
            }))
        ];
        lineChart.update();

        // Update bar chart for passive income and appreciation (optional: similar filtering can be applied)
        const filteredPassiveIncomeData = totalPassiveIncomeData.filter((_, index) => totalNetWorthData[index] > 0);
        const filteredAppreciationData = totalAppreciationData.filter((_, index) => totalNetWorthData[index] > 0);
        barChart.data.labels = filteredYears;
        barChart.data.datasets[0].data = filteredPassiveIncomeData;
        barChart.data.datasets[1].data = filteredAppreciationData;
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
