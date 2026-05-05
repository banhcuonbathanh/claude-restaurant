package repository

import (
	"context"
	"fmt"

	"banhcuon/be/internal/db"
)

// SummaryResult holds aggregated KPI metrics for one time range.
type SummaryResult struct {
	Customers    int64
	DishesSold   int64
	Revenue      int64
	ActiveTables int64
}

// TopDishRow is one row from the top-dishes query.
type TopDishRow struct {
	Name     string
	Qty      int64
	Revenue  int64
	PctTimes100 int64 // pct * 100 to avoid floats; divide by 100 on client
}

// StaffPerfRow is one row from the staff-performance query.
type StaffPerfRow struct {
	StaffID        string
	FullName       string
	Role           string
	OrdersHandled  int64
	Revenue        int64
}

// AnalyticsRepository provides read-only aggregation queries.
type AnalyticsRepository interface {
	GetSummary(ctx context.Context, rangeParam string) (SummaryResult, error)
	GetTopDishes(ctx context.Context, limit int, rangeParam string) ([]TopDishRow, error)
	GetStaffPerformance(ctx context.Context, rangeParam string) ([]StaffPerfRow, error)
}

type analyticsRepo struct {
	dbtx db.DBTX
}

// NewAnalyticsRepo creates an AnalyticsRepository.
func NewAnalyticsRepo(dbtx db.DBTX) AnalyticsRepository {
	return &analyticsRepo{dbtx: dbtx}
}

func dateFilter(alias, col, rangeParam string) string {
	full := alias + "." + col
	switch rangeParam {
	case "week":
		return fmt.Sprintf("DATE(%s) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)", full)
	case "month":
		return fmt.Sprintf("DATE(%s) >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)", full)
	default:
		return fmt.Sprintf("DATE(%s) = CURDATE()", full)
	}
}

func (r *analyticsRepo) GetSummary(ctx context.Context, rangeParam string) (SummaryResult, error) {
	// customers = orders not cancelled in range (each order = one customer visit)
	// dishes_sold = sum of order_items.quantity for delivered orders in range
	// revenue = sum of payments.amount (completed) in range
	// active_tables = live count regardless of range

	custFilter := dateFilter("o", "created_at", rangeParam)
	q := fmt.Sprintf(`
		SELECT
		  (SELECT COUNT(*) FROM orders o
		   WHERE o.deleted_at IS NULL
		     AND o.status != 'cancelled'
		     AND %s) AS customers,
		  COALESCE((
		    SELECT SUM(oi.quantity)
		    FROM order_items oi
		    JOIN orders o ON o.id = oi.order_id
		    WHERE o.deleted_at IS NULL
		      AND o.status = 'delivered'
		      AND %s
		  ), 0) AS dishes_sold,
		  COALESCE((
		    SELECT SUM(CAST(p.amount AS DECIMAL(15,0)))
		    FROM payments p
		    JOIN orders o ON o.id = p.order_id
		    WHERE p.status = 'completed'
		      AND o.deleted_at IS NULL
		      AND %s
		  ), 0) AS revenue,
		  (SELECT COUNT(DISTINCT o.table_id)
		   FROM orders o
		   WHERE o.deleted_at IS NULL
		     AND o.table_id IS NOT NULL
		     AND o.status IN ('confirmed','preparing','ready')) AS active_tables
	`, custFilter, custFilter, custFilter)

	var res SummaryResult
	err := r.dbtx.QueryRowContext(ctx, q).Scan(
		&res.Customers, &res.DishesSold, &res.Revenue, &res.ActiveTables,
	)
	if err != nil {
		return SummaryResult{}, fmt.Errorf("analytics: summary: %w", err)
	}
	return res, nil
}

func (r *analyticsRepo) GetTopDishes(ctx context.Context, limit int, rangeParam string) ([]TopDishRow, error) {
	if limit <= 0 || limit > 50 {
		limit = 5
	}
	filter := dateFilter("o", "created_at", rangeParam)
	q := fmt.Sprintf(`
		SELECT
		  oi.name,
		  SUM(oi.quantity) AS qty,
		  SUM(oi.quantity * CAST(oi.unit_price AS DECIMAL(15,0))) AS revenue
		FROM order_items oi
		JOIN orders o ON o.id = oi.order_id
		WHERE o.deleted_at IS NULL
		  AND o.status = 'delivered'
		  AND oi.combo_ref_id IS NULL
		  AND %s
		GROUP BY oi.name
		ORDER BY qty DESC
		LIMIT ?
	`, filter)

	rows, err := r.dbtx.QueryContext(ctx, q, limit)
	if err != nil {
		return nil, fmt.Errorf("analytics: top-dishes: %w", err)
	}
	defer rows.Close()

	var list []TopDishRow
	var totalQty int64
	for rows.Next() {
		var row TopDishRow
		if err := rows.Scan(&row.Name, &row.Qty, &row.Revenue); err != nil {
			return nil, fmt.Errorf("analytics: top-dishes scan: %w", err)
		}
		totalQty += row.Qty
		list = append(list, row)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("analytics: top-dishes rows: %w", err)
	}
	// compute pct * 100
	if totalQty > 0 {
		for i := range list {
			list[i].PctTimes100 = list[i].Qty * 10000 / totalQty
		}
	}
	return list, nil
}

func (r *analyticsRepo) GetStaffPerformance(ctx context.Context, rangeParam string) ([]StaffPerfRow, error) {
	filter := dateFilter("o", "created_at", rangeParam)
	q := fmt.Sprintf(`
		SELECT
		  s.id,
		  s.full_name,
		  s.role,
		  COUNT(DISTINCT o.id) AS orders_handled,
		  COALESCE(SUM(CAST(p.amount AS DECIMAL(15,0))), 0) AS revenue
		FROM staff s
		LEFT JOIN orders o
		  ON o.created_by = s.id
		  AND o.deleted_at IS NULL
		  AND o.status = 'delivered'
		  AND %s
		LEFT JOIN payments p
		  ON p.order_id = o.id
		  AND p.status = 'completed'
		WHERE s.deleted_at IS NULL
		  AND s.is_active = 1
		  AND s.role != 'customer'
		GROUP BY s.id, s.full_name, s.role
		ORDER BY orders_handled DESC, s.full_name ASC
	`, filter)

	rows, err := r.dbtx.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("analytics: staff-perf: %w", err)
	}
	defer rows.Close()

	var list []StaffPerfRow
	for rows.Next() {
		var row StaffPerfRow
		if err := rows.Scan(&row.StaffID, &row.FullName, &row.Role, &row.OrdersHandled, &row.Revenue); err != nil {
			return nil, fmt.Errorf("analytics: staff-perf scan: %w", err)
		}
		list = append(list, row)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("analytics: staff-perf rows: %w", err)
	}
	return list, nil
}

var _ AnalyticsRepository = (*analyticsRepo)(nil)
