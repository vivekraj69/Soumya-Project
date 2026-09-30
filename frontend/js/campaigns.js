// ==========================================
// MARKETIQ CAMPAIGNS
// ==========================================

const API_BASE = "";

const PAGE_SIZE = 20;

let currentPage = 1;

let totalPages = 0;

let searchTimer = null;


// ==========================================
// FORMATTERS
// ==========================================

function formatNumber(value) {

    return Number(value || 0).toLocaleString("en-IN");

}


function formatCurrency(value) {

    return "₹" + Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });

}


function formatROAS(value) {

    return Number(value || 0).toFixed(2) + "x";

}


// ==========================================
// GET FILTERS
// ==========================================

function getCampaignFilters() {

    const search =
        document
            .getElementById("campaign-search")
            .value
            .trim();


    const platform =
        document
            .getElementById("campaign-platform")
            .value;


    const objective =
        document
            .getElementById("campaign-objective")
            .value;


    const industry =
        document
            .getElementById("campaign-industry")
            .value;


    const budgetTier =
        document
            .getElementById("campaign-budget")
            .value;


    const params = new URLSearchParams();


    if (search) {

        params.append(
            "search",
            search
        );

    }


    if (platform) {

        params.append(
            "platform",
            platform
        );

    }


    if (objective) {

        params.append(
            "objective",
            objective
        );

    }


    if (industry) {

        params.append(
            "industry",
            industry
        );

    }


    if (budgetTier) {

        params.append(
            "budget_tier",
            budgetTier
        );

    }


    params.append(
        "page",
        currentPage
    );


    params.append(
        "limit",
        PAGE_SIZE
    );


    return params.toString();

}


// ==========================================
// SHOW LOADING
// ==========================================

function showLoading() {

    const tableBody =
        document.getElementById(
            "campaign-table-body"
        );


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="loading-cell"
            >
                Loading campaigns...
            </td>

        </tr>

    `;

}


// ==========================================
// LOAD CAMPAIGNS
// ==========================================

async function loadCampaigns() {

    showLoading();


    try {

        const queryString =
            getCampaignFilters();


        const response =
            await fetch(
                `${API_BASE}/api/campaigns?${queryString}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        totalPages =
            Number(data.total_pages || 0);


        renderCampaigns(
            data.campaigns || []
        );


        updatePagination(
            data
        );


    } catch (error) {

        console.error(
            "Campaign loading error:",
            error
        );


        document.getElementById(
            "campaign-table-body"
        ).innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="loading-cell"
                >
                    Unable to load campaign data.
                    Check that the Flask server is running.
                </td>

            </tr>

        `;

    }

}


// ==========================================
// RENDER CAMPAIGNS
// ==========================================

function renderCampaigns(campaigns) {

    const tableBody =
        document.getElementById(
            "campaign-table-body"
        );


    if (!campaigns.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="loading-cell"
                >
                    No campaigns match the selected filters.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        campaigns.map(
            campaign => {


                const profit =
                    Number(campaign.profit || 0);


                const profitClass =
                    profit >= 0
                        ? "profit-positive"
                        : "profit-negative";


                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    campaign.campaign_id
                                )}
                            </strong>
                        </td>


                        <td>
                            ${escapeHTML(
                                campaign.objective
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                campaign.platform
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                campaign.industry
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                campaign.budget_tier
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                campaign.ad_spend
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                campaign.revenue
                            )}
                        </td>


                        <td class="${profitClass}">
                            ${formatCurrency(
                                campaign.profit
                            )}
                        </td>


                        <td>
                            ${formatROAS(
                                campaign.roas
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                campaign.cpa
                            )}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// UPDATE PAGINATION
// ==========================================

function updatePagination(data) {

    const totalRecords =
        Number(
            data.total_records || 0
        );


    const page =
        Number(
            data.page || 1
        );


    const pages =
        Number(
            data.total_pages || 0
        );


    document.getElementById(
        "campaign-count"
    ).textContent =
        `${formatNumber(totalRecords)} matching campaigns`;


    document.getElementById(
        "page-info"
    ).textContent =
        `Page ${page} of ${pages || 1}`;


    document.getElementById(
        "pagination-text"
    ).textContent =
        `Page ${page} of ${pages || 1}`;


    document.getElementById(
        "previous-page"
    ).disabled =
        page <= 1;


    document.getElementById(
        "next-page"
    ).disabled =
        pages === 0 || page >= pages;

}


// ==========================================
// RESET TO FIRST PAGE
// ==========================================

function resetToFirstPage() {

    currentPage = 1;

    loadCampaigns();

}


// ==========================================
// SELECT FILTER EVENTS
// ==========================================

document
    .getElementById("campaign-platform")
    .addEventListener(
        "change",
        resetToFirstPage
    );


document
    .getElementById("campaign-objective")
    .addEventListener(
        "change",
        resetToFirstPage
    );


document
    .getElementById("campaign-industry")
    .addEventListener(
        "change",
        resetToFirstPage
    );


document
    .getElementById("campaign-budget")
    .addEventListener(
        "change",
        resetToFirstPage
    );


// ==========================================
// SEARCH EVENT
// ==========================================

document
    .getElementById("campaign-search")
    .addEventListener(
        "input",
        function() {


            clearTimeout(
                searchTimer
            );


            searchTimer =
                setTimeout(
                    function() {

                        currentPage = 1;

                        loadCampaigns();

                    },
                    350
                );

        }
    );


// ==========================================
// PREVIOUS PAGE
// ==========================================

document
    .getElementById("previous-page")
    .addEventListener(
        "click",
        function() {


            if (currentPage <= 1) {
                return;
            }


            currentPage--;


            loadCampaigns();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


// ==========================================
// NEXT PAGE
// ==========================================

document
    .getElementById("next-page")
    .addEventListener(
        "click",
        function() {


            if (
                totalPages === 0 ||
                currentPage >= totalPages
            ) {

                return;

            }


            currentPage++;


            loadCampaigns();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


// ==========================================
// RESET FILTERS
// ==========================================

document
    .getElementById(
        "reset-campaign-filters"
    )
    .addEventListener(
        "click",
        function() {


            document.getElementById(
                "campaign-search"
            ).value = "";


            document.getElementById(
                "campaign-platform"
            ).value = "";


            document.getElementById(
                "campaign-objective"
            ).value = "";


            document.getElementById(
                "campaign-industry"
            ).value = "";


            document.getElementById(
                "campaign-budget"
            ).value = "";


            currentPage = 1;


            loadCampaigns();

        }
    );


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadCampaigns();

    }
);