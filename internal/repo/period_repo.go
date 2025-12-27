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
`

func (r *PeriodRepo) StartPeriod(ctx context.Context, accountId int64, reportStartDate time.Time, reportEndDate time.Time, startedOn time.Time) error {
	_, err := r.db.ExecContext(ctx, QInsertPeriod,
		sql.Named("account_id", accountId),
		sql.Named("reporting_start_timestamp", reportStartDate.UnixMilli()),
		sql.Named("reporting_end_timestamp", reportEndDate.UnixMilli()),
		sql.Named("opened_on_timestamp", startedOn.UnixMilli()),
	)
	if err != nil {
		return fmt.Errorf("insert period: %w", err)
	}

	return nil
}

const QGetActivePeriod = `
	select p.id
	     , p.account_id
	     , p.reporting_start_timestamp
	     , p.opened_on_timestamp
	from periods p
	where p.account_id = @account_id
	  and p.closed_on_timestamp is null
	order by p.id desc
	limit 1
`

func (r *PeriodRepo) GetActivePeriod(ctx context.Context, accountId int64) (domain.Period, error) {
	row := r.db.QueryRowContext(ctx, QGetActivePeriod, sql.Named("account_id", accountId))

	var p domain.Period
	var startMillis int64
	var openedMillis int64
	err := row.Scan(&p.Id, &p.AccountId, &startMillis, &openedMillis)

	if err != nil {
		return p, fmt.Errorf("scan active period account %d: %w", accountId, err)
	}

	p.ReportingStart = time.UnixMilli(startMillis)
	p.OpenedOn = time.UnixMilli(openedMillis)

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
