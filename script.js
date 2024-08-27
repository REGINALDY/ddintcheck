let drugData = {}; // This will hold the mapping from drug names to interactions

// Load and parse the HTML file
async function loadDrugData(url) {
    const response = await fetch(url);
    const htmlText = await response.text();

    // Parse the HTML and extract drug interaction information
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    
    const rows = doc.querySelectorAll('table tr'); // Assuming the data is in a table

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 5) { // Assuming 5 columns: drug1, drug 2, Interaction Type, Clinical Significance, Management
            const drug1 = cells[0].textContent.trim().toLowerCase();
            const drug2 = cells[1].textContent.trim().toLowerCase();
            const interactionType = cells[2].textContent.trim();
            const clinicalSignificance = cells[3].textContent.trim();
            const management = cells[4].textContent.trim();

            // Store interaction information in both directions (drug1 -> drug2 and drug2 -> drug1)
            if (!drugData[drug1]) drugData[drug1] = {};
            if (!drugData[drug2]) drugData[drug2] = {};

            drugData[drug1][drug2] = {
                interactionType,
                clinicalSignificance,
                management
            };
            drugData[drug2][drug1] = {
                interactionType,
                clinicalSignificance,
                management
            };
        }
    });

    // Populate drugNames array after loading the data
    drugNames = Object.keys(drugData);
}

// Load the drug interaction data from the provided URL
loadDrugData('https://reginaldy.github.io/db/');

// Initialize the drug names array
let drugNames = [];

function createDrugInputGroup() {
    let inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    let newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'drug-input';
    newInput.placeholder = 'Enter drug name';
    newInput.setAttribute('oninput', 'showSuggestions(this)');

    let removeButton = document.createElement('button');
    removeButton.innerText = '-';
    removeButton.className = 'remove-drug';
    removeButton.addEventListener('click', function() {
        inputGroup.remove();
    });

    let suggestionsList = document.createElement('ul');
    suggestionsList.className = 'suggestions-list';

    inputGroup.appendChild(newInput);
    inputGroup.appendChild(removeButton);
    inputGroup.appendChild(suggestionsList);

    return inputGroup;
}

// Initialize with two input groups
function initializeDrugInputs() {
    let drugInputs = document.getElementById('drug-inputs');

    // Add the first two input groups
    drugInputs.appendChild(createDrugInputGroup());
    drugInputs.appendChild(createDrugInputGroup());
}

// Add event listener for the "+" button to add a new drug input
document.getElementById('add-drug').addEventListener('click', function() {
    let drugInputs = document.getElementById('drug-inputs');
    drugInputs.appendChild(createDrugInputGroup());
});

document.getElementById('reverse-drugs').addEventListener('click', function() {
    resetDrugInputs();
});

document.getElementById('check-interaction').addEventListener('click', function() {
    let drugs = [];
    document.querySelectorAll('.drug-input').forEach(input => {
        if (input.value.trim() !== "") {
            drugs.push(input.value.trim().toLowerCase());
        }
    });

    if (drugs.length < 2) {
        document.getElementById('results').innerText = "Please enter at least two drugs to check interactions.";
        return;
    }

    fetchDrugInteractions(drugs);
});

function showSuggestions(inputElement) {
    let inputValue = inputElement.value.toLowerCase();
    let suggestionsList = inputElement.nextElementSibling.nextElementSibling;
    suggestionsList.innerHTML = "";

    if (inputValue.length > 0) {
        let filteredDrugs = drugNames.filter(drug => drug.startsWith(inputValue));

        filteredDrugs.forEach(drug => {
            let suggestionItem = document.createElement('li');
            suggestionItem.innerText = drug;
            suggestionItem.addEventListener('click', function() {
                inputElement.value = drug;
                suggestionsList.innerHTML = "";
            });
            suggestionsList.appendChild(suggestionItem);
        });
    }
}

function fetchDrugInteractions(drugs) {
    let interactionResults = [];

    for (let i = 0; i < drugs.length; i++) {
        for (let j = i + 1; j < drugs.length; j++) {
            const drug1 = drugs[i];
            const drug2 = drugs[j];

            if (drugData[drug1] && drugData[drug1][drug2]) {
                const interaction = drugData[drug1][drug2];

                // Replace "Drug 1" and "Drug 2" with the actual drug names
                const interactionType = interaction.interactionType
                    .replace(/Drug 1/g, drug1)
                    .replace(/Drug 2/g, drug2);

                interactionResults.push(`
                    <div class="interaction-type">Interaction Type: ${interactionType}</div>
                    <div class="clinical-significance">Clinical Significance: ${interaction.clinicalSignificance}</div>
                    <div class="management">Management: ${interaction.management}</div>
                `);
            }
        }
    }

    if (interactionResults.length > 0) {
        document.getElementById('results').innerHTML = interactionResults.join("<hr>");
    } else {
        document.getElementById('results').innerText = "No known interactions found.";
    }
}

function resetDrugInputs() {
    const drugInputsContainer = document.getElementById('drug-inputs');
    drugInputsContainer.innerHTML = ''; // Clear all current input groups
    initializeDrugInputs(); // Reinitialize with two input groups
    document.getElementById('results').innerText = ''; // Clear previous results
}

// Initialize the page with two input groups
initializeDrugInputs();
