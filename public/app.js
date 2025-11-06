// Store daily intake data
let dailyIntake = {
    nutrients_consumed: null,
    food_history: []
};

// Load data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    if (dailyIntake.nutrients_consumed) {
        displayResults(dailyIntake);
    }
});

// Elements
const foodInput = document.getElementById('foodInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsSection = document.getElementById('resultsSection');

// Event listeners
analyzeBtn.addEventListener('click', analyzeFoodIntake);
clearBtn.addEventListener('click', clearData);

foodInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        analyzeFoodIntake();
    }
});

async function analyzeFoodIntake() {
    const foodDescription = foodInput.value.trim();

    if (!foodDescription) {
        alert('Please enter what you ate today');
        return;
    }

    // Update button state
    analyzeBtn.disabled = true;
    analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing...';
    analyzeBtn.querySelector('.loader').style.display = 'inline-block';

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                foodDescription,
                previousIntake: dailyIntake.nutrients_consumed
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to analyze food');
        }

        const data = await response.json();

        // Update daily intake
        dailyIntake.nutrients_consumed = data.nutrients_consumed;
        dailyIntake.food_history.push({
            description: foodDescription,
            timestamp: new Date().toLocaleTimeString()
        });

        // Save to localStorage
        saveToStorage();

        // Display results
        displayResults(data);

        // Clear input
        foodInput.value = '';

    } catch (error) {
        console.error('Error:', error);
        alert('Error analyzing food: ' + error.message);
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        analyzeBtn.querySelector('.btn-text').textContent = 'Analyze My Nutrition';
        analyzeBtn.querySelector('.loader').style.display = 'none';
    }
}

function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'block';

    // Display analysis summary
    document.getElementById('analysisSummary').textContent = data.analysis;

    // Display consumed nutrients
    displayNutrients('consumedNutrients', data.nutrients_consumed);

    // Display remaining nutrients
    displayNutrients('remainingNutrients', data.nutrients_remaining);

    // Display progress bars
    displayProgressBars(data.percentage_met);

    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';
    data.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });

    // Display food history
    const foodHistory = document.getElementById('foodHistory');
    foodHistory.innerHTML = '';
    dailyIntake.food_history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.timestamp}: ${item.description}`;
        foodHistory.appendChild(li);
    });

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayNutrients(containerId, nutrients) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Format nutrient names and values
    const nutrientUnits = {
        calories: 'kcal',
        protein: 'g',
        carbohydrates: 'g',
        fat: 'g',
        fiber: 'g',
        vitamin_c: 'mg',
        vitamin_d: 'mcg',
        calcium: 'mg',
        iron: 'mg',
        potassium: 'mg',
        sodium: 'mg'
    };

    for (const [key, value] of Object.entries(nutrients)) {
        const item = document.createElement('div');
        item.className = 'nutrient-item';

        const name = document.createElement('span');
        name.className = 'nutrient-name';
        name.textContent = key.replace(/_/g, ' ');

        const valueSpan = document.createElement('span');
        valueSpan.className = 'nutrient-value';
        const formattedValue = typeof value === 'number' ? Math.round(value * 10) / 10 : value;
        valueSpan.textContent = `${formattedValue} ${nutrientUnits[key] || ''}`;

        item.appendChild(name);
        item.appendChild(valueSpan);
        container.appendChild(item);
    }
}

function displayProgressBars(percentages) {
    const container = document.getElementById('progressBars');
    container.innerHTML = '';

    for (const [key, value] of Object.entries(percentages)) {
        const item = document.createElement('div');
        item.className = 'progress-item';

        const header = document.createElement('div');
        header.className = 'progress-header';

        const label = document.createElement('span');
        label.className = 'progress-label';
        label.textContent = key.replace(/_/g, ' ');

        const percentage = document.createElement('span');
        percentage.className = 'progress-percentage';
        percentage.textContent = `${Math.round(value)}%`;

        header.appendChild(label);
        header.appendChild(percentage);

        const bar = document.createElement('div');
        bar.className = 'progress-bar';

        const fill = document.createElement('div');
        fill.className = 'progress-fill';

        // Color coding based on percentage
        if (value < 30) {
            fill.classList.add('low');
        } else if (value < 70) {
            fill.classList.add('medium');
        } else if (value < 100) {
            fill.classList.add('high');
        } else {
            fill.classList.add('complete');
        }

        // Cap at 100% for display
        const displayValue = Math.min(value, 100);
        fill.style.width = displayValue + '%';

        bar.appendChild(fill);
        item.appendChild(header);
        item.appendChild(bar);
        container.appendChild(item);
    }
}

function clearData() {
    if (confirm('Are you sure you want to clear all data for today?')) {
        dailyIntake = {
            nutrients_consumed: null,
            food_history: []
        };
        localStorage.removeItem('nutritionTrackerData');
        resultsSection.style.display = 'none';
        foodInput.value = '';
    }
}

function saveToStorage() {
    try {
        localStorage.setItem('nutritionTrackerData', JSON.stringify(dailyIntake));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem('nutritionTrackerData');
        if (stored) {
            const data = JSON.parse(stored);

            // Check if data is from today
            const lastEntry = data.food_history[data.food_history.length - 1];
            if (lastEntry) {
                const lastDate = new Date(lastEntry.timestamp).toDateString();
                const today = new Date().toDateString();

                if (lastDate === today) {
                    dailyIntake = data;
                } else {
                    // Clear old data
                    localStorage.removeItem('nutritionTrackerData');
                }
            }
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}
