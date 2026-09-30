from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import sqlite3
from pathlib import Path

from database import init_db, DB_PATH


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"


# =========================================================
# CREATE FLASK APP
# =========================================================

app = Flask(__name__)

CORS(app)


# =========================================================
# FRONTEND ROUTES
# =========================================================

@app.route("/")
def home():

    return send_from_directory(
        str(FRONTEND_DIR),
        "index.html"
    )


@app.route("/<path:filename>")
def frontend_files(filename):

    return send_from_directory(
        str(FRONTEND_DIR),
        filename
    )


# =========================================================
# INITIALIZE DATABASE
# =========================================================

init_db()


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():

    return sqlite3.connect(DB_PATH)


# =========================================================
# SHARED FILTER HELPER
# =========================================================

def build_filters(args):

    conditions = ["1=1"]

    params = []


    objective = args.get(
        "objective",
        ""
    ).strip()


    platform = args.get(
        "platform",
        ""
    ).strip()


    industry = args.get(
        "industry",
        ""
    ).strip()


    budget_tier = args.get(
        "budget_tier",
        ""
    ).strip()


    if objective:

        conditions.append(
            "campaign_objective = ?"
        )

        params.append(
            objective
        )


    if platform:

        conditions.append(
            "platform = ?"
        )

        params.append(
            platform
        )


    if industry:

        conditions.append(
            "industry_vertical = ?"
        )

        params.append(
            industry
        )


    if budget_tier:

        conditions.append(
            "budget_tier = ?"
        )

        params.append(
            budget_tier
        )


    return (
        " AND ".join(conditions),
        params
    )


# =========================================================
# DASHBOARD KPI API
# =========================================================

@app.route("/api/dashboard/kpis")
def dashboard_kpis():

    conn = get_connection()


    where, params = build_filters(
        request.args
    )


    query = f"""

        SELECT

            SUM(impressions),
            SUM(clicks),
            SUM(conversions),
            SUM(ad_spend),
            SUM(revenue),
            SUM(profit)

        FROM campaigns

        WHERE {where}

    """


    result = conn.execute(
        query,
        params
    ).fetchone()


    conn.close()


    total_impressions = (
        result[0] or 0
    )


    total_clicks = (
        result[1] or 0
    )


    total_conversions = (
        result[2] or 0
    )


    total_spend = (
        result[3] or 0
    )


    total_revenue = (
        result[4] or 0
    )


    total_profit = (
        result[5] or 0
    )


    ctr = (

        total_clicks /
        total_impressions *
        100

        if total_impressions

        else 0

    )


    conversion_rate = (

        total_conversions /
        total_clicks *
        100

        if total_clicks

        else 0

    )


    cpa = (

        total_spend /
        total_conversions

        if total_conversions

        else 0

    )


    roas = (

        total_revenue /
        total_spend

        if total_spend

        else 0

    )


    return jsonify({

        "total_impressions":
            total_impressions,

        "total_clicks":
            total_clicks,

        "total_conversions":
            total_conversions,

        "total_spend":
            round(
                total_spend,
                2
            ),

        "total_revenue":
            round(
                total_revenue,
                2
            ),

        "total_profit":
            round(
                total_profit,
                2
            ),

        "ctr":
            round(
                ctr,
                2
            ),

        "conversion_rate":
            round(
                conversion_rate,
                2
            ),

        "cpa":
            round(
                cpa,
                2
            ),

        "roas":
            round(
                roas,
                2
            )

    })


# =========================================================
# GROUPED PERFORMANCE HELPER
# =========================================================

def grouped_performance(
    group_column,
    output_name,
    order_by="revenue DESC"
):

    conn = get_connection()


    where, params = build_filters(
        request.args
    )


    query = f"""

        SELECT

            {group_column},

            COUNT(*) AS campaigns,

            SUM(impressions) AS impressions,

            SUM(clicks) AS clicks,

            SUM(conversions) AS conversions,

            SUM(ad_spend) AS ad_spend,

            SUM(revenue) AS revenue,

            SUM(profit) AS profit

        FROM campaigns

        WHERE {where}

        GROUP BY {group_column}

        ORDER BY {order_by}

    """


    rows = conn.execute(
        query,
        params
    ).fetchall()


    conn.close()


    results = []


    for row in rows:

        name = row[0]

        campaigns = row[1]

        impressions = row[2] or 0

        clicks = row[3] or 0

        conversions = row[4] or 0

        ad_spend = row[5] or 0

        revenue = row[6] or 0

        profit = row[7] or 0


        ctr = (

            clicks /
            impressions *
            100

            if impressions

            else 0

        )


        conversion_rate = (

            conversions /
            clicks *
            100

            if clicks

            else 0

        )


        cpa = (

            ad_spend /
            conversions

            if conversions

            else 0

        )


        roas = (

            revenue /
            ad_spend

            if ad_spend

            else 0

        )


        results.append({

            output_name:
                name,

            "campaigns":
                campaigns,

            "impressions":
                impressions,

            "clicks":
                clicks,

            "conversions":
                conversions,

            "ad_spend":
                round(
                    ad_spend,
                    2
                ),

            "revenue":
                round(
                    revenue,
                    2
                ),

            "profit":
                round(
                    profit,
                    2
                ),

            "ctr":
                round(
                    ctr,
                    2
                ),

            "conversion_rate":
                round(
                    conversion_rate,
                    2
                ),

            "cpa":
                round(
                    cpa,
                    2
                ),

            "roas":
                round(
                    roas,
                    2
                )

        })


    return results


# =========================================================
# OBJECTIVE API
# =========================================================

@app.route("/api/dashboard/objectives")
def campaign_objectives():

    return jsonify(
        grouped_performance(
            "campaign_objective",
            "objective"
        )
    )


# =========================================================
# PLATFORM API
# =========================================================

@app.route("/api/dashboard/platforms")
def platform_performance():

    return jsonify(
        grouped_performance(
            "platform",
            "platform"
        )
    )


# =========================================================
# INDUSTRY API
# =========================================================

@app.route("/api/dashboard/industries")
def industry_performance():

    return jsonify(
        grouped_performance(
            "industry_vertical",
            "industry"
        )
    )


# =========================================================
# BUDGET TIER API
# =========================================================

@app.route("/api/dashboard/budget-tiers")
def budget_tier_performance():

    return jsonify(
        grouped_performance(
            "budget_tier",
            "budget_tier",
            """
            CASE budget_tier

                WHEN 'Low' THEN 1

                WHEN 'Medium' THEN 2

                WHEN 'High' THEN 3

                ELSE 4

            END
            """
        )
    )


# =========================================================
# CAMPAIGNS API
# =========================================================

@app.route("/api/campaigns")
def campaigns():

    conn = get_connection()


    search = request.args.get(
        "search",
        ""
    ).strip()


    platform = request.args.get(
        "platform",
        ""
    ).strip()


    objective = request.args.get(
        "objective",
        ""
    ).strip()


    industry = request.args.get(
        "industry",
        ""
    ).strip()


    budget_tier = request.args.get(
        "budget_tier",
        ""
    ).strip()


    try:

        page = int(
            request.args.get(
                "page",
                1
            )
        )

    except ValueError:

        page = 1


    try:

        limit = int(
            request.args.get(
                "limit",
                20
            )
        )

    except ValueError:

        limit = 20


    page = max(
        page,
        1
    )


    limit = min(
        max(
            limit,
            1
        ),
        100
    )


    offset = (
        page - 1
    ) * limit


    conditions = []

    parameters = []


    if search:

        conditions.append("""

            (
                campaign_id LIKE ?

                OR campaign_objective LIKE ?

                OR platform LIKE ?

                OR industry_vertical LIKE ?
            )

        """)


        search_value = (
            f"%{search}%"
        )


        parameters.extend([

            search_value,

            search_value,

            search_value,

            search_value

        ])


    if platform:

        conditions.append(
            "platform = ?"
        )

        parameters.append(
            platform
        )


    if objective:

        conditions.append(
            "campaign_objective = ?"
        )

        parameters.append(
            objective
        )


    if industry:

        conditions.append(
            "industry_vertical = ?"
        )

        parameters.append(
            industry
        )


    if budget_tier:

        conditions.append(
            "budget_tier = ?"
        )

        parameters.append(
            budget_tier
        )


    where_clause = ""


    if conditions:

        where_clause = (
            "WHERE " +
            " AND ".join(
                conditions
            )
        )


    count_query = f"""

        SELECT COUNT(*)

        FROM campaigns

        {where_clause}

    """


    total_records = conn.execute(
        count_query,
        parameters
    ).fetchone()[0]


    query = f"""

        SELECT

            campaign_id,

            campaign_objective,

            platform,

            industry_vertical,

            budget_tier,

            impressions,

            clicks,

            conversions,

            ad_spend,

            revenue,

            profit,

            CTR,

            conversion_rate,

            CPA,

            ROAS

        FROM campaigns

        {where_clause}

        ORDER BY revenue DESC

        LIMIT ?

        OFFSET ?

    """


    rows = conn.execute(
        query,
        parameters + [
            limit,
            offset
        ]
    ).fetchall()


    conn.close()


    campaigns_list = []


    for row in rows:

        campaigns_list.append({

            "campaign_id":
                row[0],

            "objective":
                row[1],

            "platform":
                row[2],

            "industry":
                row[3],

            "budget_tier":
                row[4],

            "impressions":
                row[5],

            "clicks":
                row[6],

            "conversions":
                row[7],

            "ad_spend":
                round(
                    row[8] or 0,
                    2
                ),

            "revenue":
                round(
                    row[9] or 0,
                    2
                ),

            "profit":
                round(
                    row[10] or 0,
                    2
                ),

            "ctr":
                round(
                    row[11] or 0,
                    2
                ),

            "conversion_rate":
                round(
                    row[12] or 0,
                    2
                ),

            "cpa":
                round(
                    row[13] or 0,
                    2
                ),

            "roas":
                round(
                    row[14] or 0,
                    2
                )

        })


    return jsonify({

        "page":
            page,

        "limit":
            limit,

        "total_records":
            total_records,

        "total_pages":

            (

                (
                    total_records +
                    limit -
                    1
                )
                // limit

                if total_records > 0

                else 0

            ),

        "campaigns":
            campaigns_list

    })


# =========================================================
# BUSINESS INSIGHTS API
# =========================================================

@app.route("/api/dashboard/insights")
def business_insights():

    conn = get_connection()


    # =====================================================
    # GET SELECTED FILTERS
    # =====================================================

    where, params = build_filters(
        request.args
    )


    # =====================================================
    # OVERALL SUMMARY
    # =====================================================

    summary_query = f"""

        SELECT

            COUNT(*) AS total_campaigns,

            SUM(impressions) AS total_impressions,

            SUM(clicks) AS total_clicks,

            SUM(conversions) AS total_conversions,

            SUM(ad_spend) AS total_spend,

            SUM(revenue) AS total_revenue,

            SUM(profit) AS total_profit

        FROM campaigns

        WHERE {where}

    """


    summary = conn.execute(
        summary_query,
        params
    ).fetchone()


    total_campaigns = (
        summary[0] or 0
    )


    total_impressions = (
        summary[1] or 0
    )


    total_clicks = (
        summary[2] or 0
    )


    total_conversions = (
        summary[3] or 0
    )


    total_spend = (
        summary[4] or 0
    )


    total_revenue = (
        summary[5] or 0
    )


    total_profit = (
        summary[6] or 0
    )


    # =====================================================
    # CALCULATE KPIs
    # =====================================================

    ctr = (

        total_clicks /
        total_impressions *
        100

        if total_impressions

        else 0

    )


    conversion_rate = (

        total_conversions /
        total_clicks *
        100

        if total_clicks

        else 0

    )


    cpa = (

        total_spend /
        total_conversions

        if total_conversions

        else 0

    )


    roas = (

        total_revenue /
        total_spend

        if total_spend

        else 0

    )


    # =====================================================
    # PROFIT VS LOSS
    # =====================================================

    status_query = f"""

        SELECT

            CASE

                WHEN profit >= 0
                THEN 'Profit'

                ELSE 'Loss'

            END AS status,

            COUNT(*) AS campaigns,

            SUM(profit) AS total_profit

        FROM campaigns

        WHERE {where}

        GROUP BY status

    """


    status_rows = conn.execute(
        status_query,
        params
    ).fetchall()


    profit_loss = []


    for row in status_rows:

        profit_loss.append({

            "status":
                row[0],

            "campaigns":
                row[1],

            "total_profit":
                round(
                    row[2] or 0,
                    2
                )

        })


    # =====================================================
    # TOP PROFITABLE CAMPAIGNS
    # =====================================================

    top_profit_query = f"""

        SELECT

            campaign_id,

            campaign_objective,

            platform,

            industry_vertical,

            budget_tier,

            ad_spend,

            revenue,

            profit,

            ROAS,

            CPA

        FROM campaigns

        WHERE {where}

        AND profit >= 0

        ORDER BY profit DESC

        LIMIT 10

    """


    top_profit_rows = conn.execute(
        top_profit_query,
        params
    ).fetchall()


    top_profitable = []


    for row in top_profit_rows:

        top_profitable.append({

            "campaign_id":
                row[0],

            "objective":
                row[1],

            "platform":
                row[2],

            "industry":
                row[3],

            "budget_tier":
                row[4],

            "ad_spend":
                round(
                    row[5] or 0,
                    2
                ),

            "revenue":
                round(
                    row[6] or 0,
                    2
                ),

            "profit":
                round(
                    row[7] or 0,
                    2
                ),

            "roas":
                round(
                    row[8] or 0,
                    2
                ),

            "cpa":
                round(
                    row[9] or 0,
                    2
                )

        })


    # =====================================================
    # TOP LOSS-MAKING CAMPAIGNS
    # =====================================================

    top_loss_query = f"""

        SELECT

            campaign_id,

            campaign_objective,

            platform,

            industry_vertical,

            budget_tier,

            ad_spend,

            revenue,

            profit,

            ROAS,

            CPA

        FROM campaigns

        WHERE {where}

        AND profit < 0

        ORDER BY profit ASC

        LIMIT 10

    """


    top_loss_rows = conn.execute(
        top_loss_query,
        params
    ).fetchall()


    top_loss_making = []


    for row in top_loss_rows:

        top_loss_making.append({

            "campaign_id":
                row[0],

            "objective":
                row[1],

            "platform":
                row[2],

            "industry":
                row[3],

            "budget_tier":
                row[4],

            "ad_spend":
                round(
                    row[5] or 0,
                    2
                ),

            "revenue":
                round(
                    row[6] or 0,
                    2
                ),

            "profit":
                round(
                    row[7] or 0,
                    2
                ),

            "roas":
                round(
                    row[8] or 0,
                    2
                ),

            "cpa":
                round(
                    row[9] or 0,
                    2
                )

        })


    # =====================================================
    # PROFIT BY OBJECTIVE
    # =====================================================

    objective_query = f"""

        SELECT

            campaign_objective,

            SUM(ad_spend) AS ad_spend,

            SUM(revenue) AS revenue,

            SUM(profit) AS profit,

            COUNT(*) AS campaigns

        FROM campaigns

        WHERE {where}

        GROUP BY campaign_objective

        ORDER BY profit DESC

    """


    objective_rows = conn.execute(
        objective_query,
        params
    ).fetchall()


    objective_profit = []


    for row in objective_rows:

        objective_profit.append({

            "objective":
                row[0],

            "ad_spend":
                round(
                    row[1] or 0,
                    2
                ),

            "revenue":
                round(
                    row[2] or 0,
                    2
                ),

            "profit":
                round(
                    row[3] or 0,
                    2
                ),

            "campaigns":
                row[4]

        })


    # =====================================================
    # PROFIT BY PLATFORM
    # =====================================================

    platform_query = f"""

        SELECT

            platform,

            SUM(ad_spend) AS ad_spend,

            SUM(revenue) AS revenue,

            SUM(profit) AS profit,

            COUNT(*) AS campaigns

        FROM campaigns

        WHERE {where}

        GROUP BY platform

        ORDER BY profit DESC

    """


    platform_rows = conn.execute(
        platform_query,
        params
    ).fetchall()


    platform_profit = []


    for row in platform_rows:

        platform_profit.append({

            "platform":
                row[0],

            "ad_spend":
                round(
                    row[1] or 0,
                    2
                ),

            "revenue":
                round(
                    row[2] or 0,
                    2
                ),

            "profit":
                round(
                    row[3] or 0,
                    2
                ),

            "campaigns":
                row[4]

        })


    # =====================================================
    # CLOSE DATABASE
    # =====================================================

    conn.close()


    # =====================================================
    # PROFITABLE / LOSS COUNTS
    # =====================================================

    profitable_campaigns = next(

        (

            item["campaigns"]

            for item in profit_loss

            if item["status"] == "Profit"

        ),

        0

    )


    loss_campaigns = next(

        (

            item["campaigns"]

            for item in profit_loss

            if item["status"] == "Loss"

        ),

        0

    )


    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return jsonify({

        "overall_summary": {

            "total_campaigns":
                total_campaigns,

            "total_impressions":
                total_impressions,

            "total_clicks":
                total_clicks,

            "total_conversions":
                total_conversions,

            "total_spend":
                round(
                    total_spend,
                    2
                ),

            "total_revenue":
                round(
                    total_revenue,
                    2
                ),

            "total_profit":
                round(
                    total_profit,
                    2
                ),

            "ctr":
                round(
                    ctr,
                    2
                ),

            "conversion_rate":
                round(
                    conversion_rate,
                    2
                ),

            "cpa":
                round(
                    cpa,
                    2
                ),

            "roas":
                round(
                    roas,
                    2
                ),

            "profitable_campaigns":
                profitable_campaigns,

            "loss_campaigns":
                loss_campaigns

        },


        "profit_loss":
            profit_loss,


        "top_profitable_campaigns":
            top_profitable,


        "top_loss_making_campaigns":
            top_loss_making,


        "objective_profit":
            objective_profit,


        "platform_profit":
            platform_profit

    })


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )