package repo

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/domain"
)

type PeriodRepo struct {
	db *sql.DB
}

func NewPeriodRepo(db *sql.DB) *PeriodRepo {
	return &PeriodRepo{db: db}
}

const QInsertPeriod = `
	insert into periods (
		account_id, 
		reporting_start_timestamp, 
		reporting_end_timestamp, 
		opened_on_timestamp
	)
	values (
		@account_id, 
		@reporting_start_timestamp, 
		@reporting_end_timestamp, 
		@opened_on_timestamp
	)
	returning id, account_id, reporting_start_timestamp, reporting_end_timestamp, opened_on_timestamp
`

func (r *PeriodRepo) StartPeriod(ctx context.Context, accountId int64, reportStartDate time.Time, reportEndDate time.Time, startedOn time.Time) (domain.Period, error) {
	var p domain.Period
	row := r.db.QueryRowContext(ctx, QInsertPeriod,
		sql.Named("account_id", accountId),
		sql.Named("reporting_start_timestamp", reportStartDate.UnixMilli()),
		sql.Named("reporting_end_timestamp", reportEndDate.UnixMilli()),
		sql.Named("opened_on_timestamp", startedOn.UnixMilli()),
	)

	var startMillis int64
	var endMillis int64
	var openedOnMillis int64
	err := row.Scan(&p.Id, &p.AccountId, &startMillis, &endMillis, &openedOnMillis)
	if err != nil {
		return p, fmt.Errorf("insert period: %w", err)
	}

	p.ReportingStart = time.UnixMilli(startMillis).UTC()
	p.ReportingEnd = time.UnixMilli(endMillis).UTC()
	p.OpenedOn = time.UnixMilli(openedOnMillis).UTC()

	return p, nil
}

const QGetActivePeriod = `
with tx as (select t.account_id, t.period_id, coalesce(sum(t.amount), 0) balance
            from transactions t
            group by t.account_id, t.period_id)
select 
	p.id, 
	p.reporting_start_timestamp, 
	p.reporting_end_timestamp, 
	p.opened_on_timestamp, 
	p.closed_on_timestamp,
	t.balance
from periods p
left join tx t on t.period_id = p.id
where p.account_id = @account_id
  and ((@period_id >= 0 and @period_id = p.id) or p.closed_on_timestamp is null)
order by id
limit 1
`
const ActivePeriodId = 0

// GetPeriod Pass periodId ActivePeriodId (0) to get the latest active period
func (r *PeriodRepo) GetPeriod(ctx context.Context, accountId int64, periodId int64) (domain.Period, error) {
	row := r.db.QueryRowContext(ctx, QGetActivePeriod,
		sql.Named("account_id", accountId),
		sql.Named("period_id", periodId),
	)

	var p domain.Period
	var startMillis int64
	var endMillis int64
	var openedMillis int64
	var closedMillis sql.NullInt64
	err := row.Scan(&p.Id, &startMillis, &endMillis, &openedMillis, &closedMillis, &p.Balance)

	if err != nil {
		return p, fmt.Errorf("scan active period account %d: %w", accountId, err)
	}

	p.ReportingStart = time.UnixMilli(startMillis).UTC()
	p.ReportingEnd = time.UnixMilli(endMillis).UTC()
	p.OpenedOn = time.UnixMilli(openedMillis).UTC()

	if closedMillis.Valid {
		p.ClosedOn = time.UnixMilli(closedMillis.Int64).UTC()
	}

	return p, nil
}

const QClosePeriod = `update periods set closed_on_timestamp = @closed_on_timestamp where id = @id`

func (r *PeriodRepo) ClosePeriod(ctx context.Context, periodId int64) error {
	_, err := r.db.ExecContext(ctx, QClosePeriod,
		sql.Named("closed_on_timestamp", time.Now().UnixMilli()),
		sql.Named("id", periodId),
	)
	return err
}
