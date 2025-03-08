document.addEventListener("DOMContentLoaded", function () {
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");
    const amount = document.getElementById("amount");
    const dateInput = document.getElementById("date");
    const swapButton = document.getElementById("swapCurrencies");
    const convertButton = document.getElementById("convertBtn");
    const clearAmountBtn = document.getElementById("clearAmountBtn");
    const resultDisplay = document.getElementById("result");

    // Default values
    amount.value = "1";
    amount.setAttribute("min", "1"); // Prevent negative values

    function clearAmountField() {
        amount.value = ""; // Clear the input
        amount.placeholder = "Enter amount"; // Show placeholder
        amount.focus(); // Keep focus on input
    }

    // Prevent manual date entry
    dateInput.addEventListener("keydown", function (event) {
        event.preventDefault();
    });

    // Set the date field limit to last 365 days
    let today = new Date();
    let lastYear = new Date();
    lastYear.setDate(today.getDate() - 365);
    dateInput.setAttribute("min", lastYear.toISOString().split("T")[0]);
    dateInput.setAttribute("max", today.toISOString().split("T")[0]);

    // Load currency options
    async function loadCurrencies() {
        try {
            let response = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json");
            if (!response.ok) throw new Error("Failed to fetch currencies");

            let currencies = await response.json();
            fromCurrency.innerHTML = "";
            toCurrency.innerHTML = "";

            for (let code in currencies) {
                let optionFrom = new Option(`${code.toUpperCase()} - ${currencies[code]}`, code);
                let optionTo = new Option(`${code.toUpperCase()} - ${currencies[code]}`, code);
                fromCurrency.appendChild(optionFrom);
                toCurrency.appendChild(optionTo);
            }

            // Set default selections
            fromCurrency.value = "usd";
            toCurrency.value = "eur";

            // Load default conversion result
            convertCurrency();
        } catch (error) {
            console.error("Error loading currencies:", error);
            resultDisplay.innerHTML = "⚠ Failed to load currencies!";
        }
    }

    // Swap currency selections
    swapButton.addEventListener("click", function () {
        let temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        convertCurrency();
    });

    // Clear date field
    window.clearDateField = function () {
        dateInput.value = "";
    };

    // Convert currency function
    async function convertCurrency() {
        const from = fromCurrency.value;
        const to = toCurrency.value;
        const amountValue = parseFloat(amount.value) || 1;
        let date = dateInput.value || "latest";

        if (isNaN(amountValue) || amount.value.trim() === "" || amountValue < 1) {
            amount.value = "1"; // Set to 1 if empty, NaN, or negative
            return;
        }

        let url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${from}.json`;
        let fallbackUrl = `https://${date}.currency-api.pages.dev/v1/currencies/${from}.json`;

        try {
            let response = await fetch(url);
            if (!response.ok) throw new Error("Primary API failed");
            let data = await response.json();
            let rate = data[from][to];

            resultDisplay.innerHTML = `${amountValue} ${from.toUpperCase()} = ${(amountValue * rate).toFixed(2)} ${to.toUpperCase()}`;
        } catch (error) {
            console.log("Using fallback API...");
            let fallbackResponse = await fetch(fallbackUrl);
            if (!fallbackResponse.ok) {
                resultDisplay.innerHTML = "Error fetching exchange rate!";
                return;
            }
            let fallbackData = await fallbackResponse.json();
            let fallbackRate = fallbackData[from][to];

            resultDisplay.innerHTML = `${amountValue} ${from.toUpperCase()} = ${(amountValue * fallbackRate).toFixed(2)} ${to.toUpperCase()}`;
        }
    }

    // Event Listeners
    amount.addEventListener("input", convertCurrency);
    fromCurrency.addEventListener("change", convertCurrency);
    toCurrency.addEventListener("change", convertCurrency);
    dateInput.addEventListener("change", convertCurrency);
    convertButton.addEventListener("click", convertCurrency);
    clearAmountBtn.addEventListener("click", clearAmountField); // **Fix for Clear Amount Button**

    // Load currencies on page load
    loadCurrencies();
});
