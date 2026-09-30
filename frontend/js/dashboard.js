// ==========================================
// MARKETIQ DASHBOARD
// ==========================================

const API_BASE = "";

// ==========================================
// FORMATTERS
// ==========================================

function formatNumber(value) {
    return Number(value).toLocaleString("en-IN");
}

function formatCurrency(value) {
    return "₹" + Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });
}

function formatPercentage(value) {
    return Number(value).toFixed(2) + "%";
}

function formatROAS(value) {
    return Number(value).toFixed(2) + "x";
}


// ==========================================
// GET CURRENT FILTERS
// ==========================================

function getFilterParams() {

    const objective = document.getElementById("objective-filter").value;
    const platform = document.getElementById("platform-filter").value;
    const industry = document.getElementById("industry-filter").value;
    const budgetTier = document.getElementById("budget-filter").value;

    const params = new URLSearchParams();

    if (objective) {
        params.append("objective", objective);
    }

    if (platform) {
        params.append("platform", platform);
    }

    if (industry) {
        params.append("industry", industry);
    }

    if (budgetTier) {
        params.append("budget_tier", budgetTier);
    }

    return params.toString();
}


// ==========================================
// LOAD KPI DATA
// ==========================================

async function loadKPIs() {

    try {

        const queryString = getFilterParams();

        const response = await fetch(
            `${API_BASE}/api/dashboard/kpis?${queryString}`
        );

        if (!response.ok) {
            throw new Error("Failed to load KPI data");
        }

        const data = await response.json();

        document.getElementById("total-spend").textContent =
            formatCurrency(data.total_spend);

        document.getElementById("total-revenue").textContent =
            formatCurrency(data.total_revenue);

        document.getElementById("total-profit").textContent =
            formatCurrency(data.total_profit);

        document.getElementById("total-conversions").textContent =
            formatNumber(data.total_conversions);

        document.getElementById("ctr").textContent =
            formatPercentage(data.ctr);

        document.getElementById("roas").textContent =
            formatROAS(data.roas);

        document.getElementById("conversion-rate").textContent =
            formatPercentage(data.conversion_rate);

        document.getElementById("cpa").textContent =
            formatCurrency(data.cpa);

        document.getElementById("total-impressions").textContent =
            formatNumber(data.total_impressions);

    } catch (error) {

        console.error("KPI Error:", error);

    }
}


// ==========================================
// CHART VARIABLES
// ==========================================

let objectiveRevenueChart;
let platformProfitChart;
let industryRoasChart;
let budgetPerformanceChart;


// ==========================================
// REVENUE BY OBJECTIVE
// ==========================================

async function loadObjectiveChart() {

    try {

        const queryString = getFilterParams();

        const response = await fetch(
            `${API_BASE}/api/dashboard/objectives?${queryString}`
        );

        const data = await response.json();

        const labels = data.map(item => item.objective);
        const values = data.map(item => item.revenue);

        const ctx = document
            .getElementById("objectiveRevenueChart")
            .getContext("2d");

        if (objectiveRevenueChart) {
            objectiveRevenueChart.destroy();
        }

        objectiveRevenueChart = new Chart(ctx, {
            type: "bar",

            data: {
                labels: labels,

                datasets: [{
                    label: "Revenue",
                    data: values,
                    borderWidth: 1
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            callback: function(value) {
                                return "₹" +
                                    (value / 1000000).toFixed(0) +
                                    "M";
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {

        console.error("Objective chart error:", error);

    }
}


// ==========================================
// PROFIT BY PLATFORM
// ==========================================

async function loadPlatformChart() {

    try {

        const queryString = getFilterParams();

        const response = await fetch(
            `${API_BASE}/api/dashboard/platforms?${queryString}`
        );

        const data = await response.json();

        const labels = data.map(item => item.platform);
        const values = data.map(item => item.profit);

        const ctx = document
            .getElementById("platformProfitChart")
            .getContext("2d");

        if (platformProfitChart) {
            platformProfitChart.destroy();
        }

        platformProfitChart = new Chart(ctx, {
            type: "bar",

            data: {
                labels: labels,

                datasets: [{
                    label: "Profit",
                    data: values,
                    borderWidth: 1
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            callback: function(value) {
                                return "₹" +
                                    (value / 1000000).toFixed(0) +
                                    "M";
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {

        console.error("Platform chart error:", error);

    }
}


// ==========================================
// ROAS BY INDUSTRY
// ==========================================

async function loadIndustryChart() {

    try {

        const queryString = getFilterParams();

        const response = await fetch(
            `${API_BASE}/api/dashboard/industries?${queryString}`
        );

        const data = await response.json();

        const labels = data.map(item => item.industry);
        const values = data.map(item => item.roas);

        const ctx = document
            .getElementById("industryRoasChart")
            .getContext("2d");

        if (industryRoasChart) {
            industryRoasChart.destroy();
        }

        industryRoasChart = new Chart(ctx, {
            type: "bar",

            data: {
                labels: labels,

                datasets: [{
                    label: "ROAS",
                    data: values,
                    borderWidth: 1
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            callback: function(value) {
                                return value + "x";
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {

        console.error("Industry chart error:", error);

    }
}


// ==========================================
// BUDGET PERFORMANCE
// ==========================================

async function loadBudgetChart() {

    try {

        const queryString = getFilterParams();

        const response = await fetch(
            `${API_BASE}/api/dashboard/budget-tiers?${queryString}`
        );

        const data = await response.json();

        const labels = data.map(item => item.budget_tier);
        const values = data.map(item => item.roas);

        const ctx = document
            .getElementById("budgetPerformanceChart")
            .getContext("2d");

        if (budgetPerformanceChart) {
            budgetPerformanceChart.destroy();
        }

        budgetPerformanceChart = new Chart(ctx, {
            type: "bar",

            data: {
                labels: labels,

                datasets: [{
                    label: "ROAS",
                    data: values,
                    borderWidth: 1
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            callback: function(value) {
                                return value + "x";
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {

        console.error("Budget chart error:", error);

    }
}


// ==========================================
// LOAD EVERYTHING
// ==========================================

async function loadDashboard() {

    console.log("Loading MarketIQ dashboard...");

    await loadKPIs();
    await loadObjectiveChart();
    await loadPlatformChart();
    await loadIndustryChart();
    await loadBudgetChart();

    console.log("Dashboard loaded successfully!");
}


// ==========================================
// APPLY FILTERS
// ==========================================

async function applyFilters() {

    console.log("Applying filters...");

    await loadKPIs();
    await loadObjectiveChart();
    await loadPlatformChart();
    await loadIndustryChart();
    await loadBudgetChart();

    console.log("Filters applied!");
}


// ==========================================
// FILTER EVENTS
// ==========================================

document.getElementById("objective-filter")
    .addEventListener("change", applyFilters);

document.getElementById("platform-filter")
    .addEventListener("change", applyFilters);

document.getElementById("industry-filter")
    .addEventListener("change", applyFilters);

document.getElementById("budget-filter")
    .addEventListener("change", applyFilters);


// ==========================================
// RESET FILTERS
// ==========================================

document.getElementById("reset-filters")
    .addEventListener("click", async function() {

        document.getElementById("objective-filter").value = "";
        document.getElementById("platform-filter").value = "";
        document.getElementById("industry-filter").value = "";
        document.getElementById("budget-filter").value = "";

        await loadDashboard();
    });


// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", loadDashboard);