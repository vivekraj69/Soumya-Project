/* =========================================================
   MARKETIQ — BUSINESS INSIGHTS
   ========================================================= */

const API_BASE = "";

let profitLossChart = null;
let objectiveProfitChart = null;
let platformProfitChart = null;
let revenueProfitChart = null;


/* =========================================================
   FORMAT FUNCTIONS
   ========================================================= */

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-IN");
}


function formatCurrency(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });
}


function formatPercentage(value) {
    return Number(value || 0).toFixed(2) + "%";
}


function formatROAS(value) {
    return Number(value || 0).toFixed(2) + "x";
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   FILTERS
   ========================================================= */

function getFilterParams() {

    const params = new URLSearchParams();

    const objective =
        document.getElementById("objective-filter")?.value || "";

    const platform =
        document.getElementById("platform-filter")?.value || "";

    const industry =
        document.getElementById("industry-filter")?.value || "";

    const budget =
        document.getElementById("budget-filter")?.value || "";


    if (objective) {
        params.append("objective", objective);
    }


    if (platform) {
        params.append("platform", platform);
    }


    if (industry) {
        params.append("industry", industry);
    }


    if (budget) {
        params.append("budget_tier", budget);
    }


    return params;

}


/* =========================================================
   LOAD BUSINESS INSIGHTS
   ========================================================= */

async function loadBusinessInsights() {

    try {

        showLoadingState();


        const params = getFilterParams();

        const queryString = params.toString();


        const url =
            queryString
                ? `${API_BASE}/api/dashboard/insights?${queryString}`
                : `${API_BASE}/api/dashboard/insights`;


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Business Insights request failed: ${response.status}`
            );

        }


        const data = await response.json();


        console.log(
            "Business Insights API response:",
            data
        );


        /* -----------------------------------------
           UPDATE SUMMARY
           ----------------------------------------- */

        updateOverallSummary(data);

        updateSummaryCards(data);


        /* -----------------------------------------
           UPDATE CHARTS
           ----------------------------------------- */

        drawProfitLossChart(
            data.profit_loss || []
        );


        drawObjectiveProfitChart(
            data.objective_profit || []
        );


        drawPlatformProfitChart(
            data.platform_profit || []
        );


        drawRevenueProfitChart(
            data.objective_profit || []
        );


        /* -----------------------------------------
           UPDATE CAMPAIGN LISTS
           ----------------------------------------- */

        renderTopProfitableCampaigns(
            data.top_profitable_campaigns || []
        );


        renderTopLossMakingCampaigns(
            data.top_loss_making_campaigns || []
        );


        console.log(
            "Business Insights loaded successfully!"
        );

    }

    catch (error) {

        console.error(
            "Business Insights Error:",
            error
        );

        showErrorState();

    }

}


/* =========================================================
   PERFORMANCE SUMMARY
   ========================================================= */

function updateOverallSummary(data) {

    const summary =
        data.overall_summary || {};


    const totalCampaigns =
        Number(summary.total_campaigns || 0);


    const totalSpend =
        Number(summary.total_spend || 0);


    const totalRevenue =
        Number(summary.total_revenue || 0);


    const totalProfit =
        Number(summary.total_profit || 0);


    const ctr =
        Number(summary.ctr || 0);


    const conversionRate =
        Number(summary.conversion_rate || 0);


    const roas =
        Number(summary.roas || 0);


    const cpa =
        Number(summary.cpa || 0);


    const profitableCampaigns =
        Number(summary.profitable_campaigns || 0);


    const lossCampaigns =
        Number(summary.loss_campaigns || 0);


    /* -----------------------------------------
       METRIC BOXES
       ----------------------------------------- */

    const ctrElement =
        document.getElementById("summary-ctr");

    const conversionElement =
        document.getElementById(
            "summary-conversion-rate"
        );

    const roasElement =
        document.getElementById("summary-roas");

    const cpaElement =
        document.getElementById("summary-cpa");


    if (ctrElement) {

        ctrElement.textContent =
            formatPercentage(ctr);

    }


    if (conversionElement) {

        conversionElement.textContent =
            formatPercentage(conversionRate);

    }


    if (roasElement) {

        roasElement.textContent =
            formatROAS(roas);

    }


    if (cpaElement) {

        cpaElement.textContent =
            formatCurrency(cpa);

    }


    /* -----------------------------------------
       SUMMARY POINTS
       ----------------------------------------- */

    const summaryText =
        document.getElementById(
            "overall-summary-text"
        );


    if (!summaryText) {
        return;
    }


    /* -----------------------------------------
       NO RESULTS
       ----------------------------------------- */

    if (totalCampaigns === 0) {

        summaryText.innerHTML = `

            <div class="summary-point">

                <span>
                    No campaigns match the selected filters.
                    Try changing or resetting your filters.
                </span>

            </div>

        `;

        return;

    }


    /* -----------------------------------------
       NORMAL SUMMARY
       ----------------------------------------- */

    summaryText.innerHTML = `

        <div class="summary-point">

            <span>

                The selected dataset contains

                <strong>
                    ${formatNumber(totalCampaigns)}
                </strong>

                campaigns.

            </span>

        </div>


        <div class="summary-point">

            <span>

                Total advertising spend is

                <strong>
                    ${formatCurrency(totalSpend)}
                </strong>

                and generated revenue is

                <strong>
                    ${formatCurrency(totalRevenue)}
                </strong>.

            </span>

        </div>


        <div class="summary-point">

            <span>

                Total profit generated is

                <strong>
                    ${formatCurrency(totalProfit)}
                </strong>.

            </span>

        </div>


        <div class="summary-point">

            <span>

                Campaigns achieved a

                <strong>
                    ${formatPercentage(ctr)}
                </strong>

                CTR and

                <strong>
                    ${formatPercentage(conversionRate)}
                </strong>

                conversion rate.

            </span>

        </div>


        <div class="summary-point">

            <span>

                The overall ROAS is

                <strong>
                    ${formatROAS(roas)}
                </strong>,

                with a CPA of

                <strong>
                    ${formatCurrency(cpa)}
                </strong>.

            </span>

        </div>


        <div class="summary-point">

            <span>

                <strong>
                    ${formatNumber(profitableCampaigns)}
                </strong>

                campaigns were profitable, while

                <strong>
                    ${formatNumber(lossCampaigns)}
                </strong>

                campaigns recorded losses.

            </span>

        </div>

    `;

}


/* =========================================================
   SUMMARY CARDS
   ========================================================= */

function updateSummaryCards(data) {

    const profitLoss =
        data.profit_loss || [];


    const profitGroup =
        profitLoss.find(
            item => item.status === "Profit"
        );


    const lossGroup =
        profitLoss.find(
            item => item.status === "Loss"
        );


    const profitableCount =
        profitGroup
            ? Number(profitGroup.campaigns || 0)
            : 0;


    const lossCount =
        lossGroup
            ? Number(lossGroup.campaigns || 0)
            : 0;


    const profitableElement =
        document.getElementById(
            "profitable-count"
        );


    const lossElement =
        document.getElementById(
            "loss-count"
        );


    const totalProfitElement =
        document.getElementById(
            "total-profit"
        );


    if (profitableElement) {

        profitableElement.textContent =
            formatNumber(profitableCount);

    }


    if (lossElement) {

        lossElement.textContent =
            formatNumber(lossCount);

    }


    const totalProfit =
        (data.objective_profit || []).reduce(
            (total, item) =>
                total + Number(item.profit || 0),
            0
        );


    if (totalProfitElement) {

        totalProfitElement.textContent =
            formatCurrency(totalProfit);

    }

}


/* =========================================================
   PROFIT VS LOSS CHART
   ========================================================= */

function drawProfitLossChart(data) {

    const canvas =
        document.getElementById(
            "profitLossChart"
        );


    if (!canvas) {
        return;
    }


    const labels =
        data.map(
            item => item.status
        );


    const values =
        data.map(
            item => Number(item.campaigns || 0)
        );


    if (profitLossChart) {

        profitLossChart.destroy();

    }


    profitLossChart = new Chart(
        canvas.getContext("2d"),
        {

            type: "doughnut",

            data: {

                labels,

                datasets: [

                    {

                        label: "Campaigns",

                        data: values,

                        backgroundColor:
                            labels.map(
                                label =>
                                    label === "Profit"
                                        ? "#10b981"
                                        : "#ef4444"
                            ),

                        borderWidth: 2,

                        borderColor: "#ffffff"

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",


                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            padding: 18,

                            font: {

                                family: "Inter",

                                size: 11

                            }

                        }

                    },


                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    return (
                                        " " +
                                        context.label +
                                        ": " +
                                        formatNumber(
                                            context.raw
                                        ) +
                                        " campaigns"
                                    );

                                }

                        }

                    }

                }

            }

        }
    );

}


/* =========================================================
   OBJECTIVE PROFIT CHART
   ========================================================= */

function drawObjectiveProfitChart(data) {

    const canvas =
        document.getElementById(
            "objectiveProfitChart"
        );


    if (!canvas) {
        return;
    }


    const labels =
        data.map(
            item => item.objective
        );


    const values =
        data.map(
            item => Number(item.profit || 0)
        );


    if (objectiveProfitChart) {

        objectiveProfitChart.destroy();

    }


    objectiveProfitChart = new Chart(
        canvas.getContext("2d"),
        {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {

                        label: "Profit",

                        data: values,

                        borderWidth: 1

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        display: false

                    },


                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    return (
                                        " Profit: " +
                                        formatCurrency(
                                            context.raw
                                        )
                                    );

                                }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function(value) {

                                    return (
                                        "₹" +
                                        (
                                            value /
                                            1000000
                                        ).toFixed(0) +
                                        "M"
                                    );

                                }

                        }

                    }

                }

            }

        }
    );

}


/* =========================================================
   PLATFORM PROFIT CHART
   ========================================================= */

function drawPlatformProfitChart(data) {

    const canvas =
        document.getElementById(
            "platformProfitChart"
        );


    if (!canvas) {
        return;
    }


    const labels =
        data.map(
            item => item.platform
        );


    const values =
        data.map(
            item => Number(item.profit || 0)
        );


    if (platformProfitChart) {

        platformProfitChart.destroy();

    }


    platformProfitChart = new Chart(
        canvas.getContext("2d"),
        {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {

                        label: "Profit",

                        data: values,

                        borderWidth: 1

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        display: false

                    },


                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    return (
                                        " Profit: " +
                                        formatCurrency(
                                            context.raw
                                        )
                                    );

                                }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function(value) {

                                    return (
                                        "₹" +
                                        (
                                            value /
                                            1000000
                                        ).toFixed(0) +
                                        "M"
                                    );

                                }

                        }

                    }

                }

            }

        }
    );

}


/* =========================================================
   AD SPEND VS REVENUE
   ========================================================= */

function drawRevenueProfitChart(data) {

    const canvas =
        document.getElementById(
            "revenueProfitChart"
        );


    if (!canvas) {
        return;
    }


    const points =
        data.map(
            item => ({

                x: Number(
                    item.ad_spend || 0
                ),

                y: Number(
                    item.revenue || 0
                ),

                label:
                    item.objective

            })
        );


    if (revenueProfitChart) {

        revenueProfitChart.destroy();

    }


    revenueProfitChart = new Chart(
        canvas.getContext("2d"),
        {

            type: "scatter",

            data: {

                datasets: [

                    {

                        label:
                            "Campaign Objective",

                        data: points,

                        pointRadius: 7,

                        pointHoverRadius: 9,

                        borderWidth: 1

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        display: false

                    },


                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    const point =
                                        context.raw;


                                    return [

                                        String(
                                            point.label
                                        ),

                                        "Ad Spend: " +
                                        formatCurrency(
                                            point.x
                                        ),

                                        "Revenue: " +
                                        formatCurrency(
                                            point.y
                                        )

                                    ];

                                }

                        }

                    }

                },


                scales: {

                    x: {

                        beginAtZero: true,

                        title: {

                            display: true,

                            text: "Ad Spend"

                        },


                        ticks: {

                            callback:
                                function(value) {

                                    return (
                                        "₹" +
                                        (
                                            value /
                                            1000000
                                        ).toFixed(0) +
                                        "M"
                                    );

                                }

                        }

                    },


                    y: {

                        beginAtZero: true,

                        title: {

                            display: true,

                            text: "Revenue"

                        },


                        ticks: {

                            callback:
                                function(value) {

                                    return (
                                        "₹" +
                                        (
                                            value /
                                            1000000
                                        ).toFixed(0) +
                                        "M"
                                    );

                                }

                        }

                    }

                }

            }

        }
    );

}


/* =========================================================
   TOP PROFITABLE CAMPAIGNS
   ========================================================= */

function renderTopProfitableCampaigns(data) {

    const container =
        document.getElementById(
            "top-profitable-list"
        );


    if (!container) {
        return;
    }


    if (!data.length) {

        container.innerHTML = `

            <div class="empty-state">

                No profitable campaigns match
                the selected filters.

            </div>

        `;

        return;

    }


    container.innerHTML =
        data.map(
            campaign => `

                <div class="insight-item">

                    <div class="insight-item-left">

                        <div class="insight-item-title">

                            ${escapeHTML(
                                campaign.campaign_id
                            )}

                        </div>


                        <div class="insight-item-subtitle">

                            ${escapeHTML(
                                campaign.objective
                            )}

                            •

                            ${escapeHTML(
                                campaign.platform
                            )}

                            •

                            ROAS
                            ${formatROAS(
                                campaign.roas
                            )}

                        </div>

                    </div>


                    <div class="insight-item-value profit-positive">

                        ${formatCurrency(
                            campaign.profit
                        )}

                    </div>

                </div>

            `
        ).join("");

}


/* =========================================================
   TOP LOSS-MAKING CAMPAIGNS
   ========================================================= */

function renderTopLossMakingCampaigns(data) {

    const container =
        document.getElementById(
            "top-loss-list"
        );


    if (!container) {
        return;
    }


    if (!data.length) {

        container.innerHTML = `

            <div class="empty-state">

                No loss-making campaigns match
                the selected filters.

            </div>

        `;

        return;

    }


    container.innerHTML =
        data.map(
            campaign => `

                <div class="insight-item">

                    <div class="insight-item-left">

                        <div class="insight-item-title">

                            ${escapeHTML(
                                campaign.campaign_id
                            )}

                        </div>


                        <div class="insight-item-subtitle">

                            ${escapeHTML(
                                campaign.objective
                            )}

                            •

                            ${escapeHTML(
                                campaign.platform
                            )}

                            •

                            ROAS
                            ${formatROAS(
                                campaign.roas
                            )}

                        </div>

                    </div>


                    <div class="insight-item-value profit-negative">

                        ${formatCurrency(
                            campaign.profit
                        )}

                    </div>

                </div>

            `
        ).join("");

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showLoadingState() {

    const summary =
        document.getElementById(
            "overall-summary-text"
        );


    if (summary) {

        summary.textContent =
            "Updating performance summary...";

    }


    const profitable =
        document.getElementById(
            "top-profitable-list"
        );


    const losses =
        document.getElementById(
            "top-loss-list"
        );


    if (profitable) {

        profitable.innerHTML = `

            <div class="loading-state">

                Updating campaign insights...

            </div>

        `;

    }


    if (losses) {

        losses.innerHTML = `

            <div class="loading-state">

                Updating campaign insights...

            </div>

        `;

    }

}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showErrorState() {

    const summary =
        document.getElementById(
            "overall-summary-text"
        );


    if (summary) {

        summary.textContent =
            "Unable to load the performance summary. Check that the Flask server is running.";

    }


    [
        "top-profitable-list",
        "top-loss-list"

    ].forEach(
        id => {

            const element =
                document.getElementById(id);


            if (element) {

                element.innerHTML = `

                    <div class="error-state">

                        Unable to load business insights.
                        Check that the Flask server is running.

                    </div>

                `;

            }

        }
    );

}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function resetInsightFilters() {

    document.getElementById(
        "objective-filter"
    ).value = "";


    document.getElementById(
        "platform-filter"
    ).value = "";


    document.getElementById(
        "industry-filter"
    ).value = "";


    document.getElementById(
        "budget-filter"
    ).value = "";


    loadBusinessInsights();

}


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        [
            "objective-filter",
            "platform-filter",
            "industry-filter",
            "budget-filter"

        ].forEach(
            id => {

                const element =
                    document.getElementById(id);


                if (element) {

                    element.addEventListener(
                        "change",
                        loadBusinessInsights
                    );

                }

            }
        );


        const resetButton =
            document.getElementById(
                "reset-insight-filters"
            );


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetInsightFilters
            );

        }


        loadBusinessInsights();

    }
);