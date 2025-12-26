package repo

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/domain"
)

type AccountRepo struct {
	db *sql.DB
}

func NewAccountRepo(db *sql.DB) *AccountRepo {
	return &AccountRepo{db: db}
}

const QListAccount = `
select a.id
     , p.id as period_id
	 , a.name
	 , a.period_start_day
	 , coalesce(sum(t.amount), 0) as total_available
	 , p.reporting_start_timestamp
	 , p.reporting_end_timestamp
	 , p.opened_on_timestamp
from accounts a
	left join transactions t on a.id = t.account_id
	left join periods p on a.id = p.account_id
	where p.closed_on_timestamp is null
	group by a.id, a.name
`

func (r *AccountRepo) List(ctx context.Context) ([]domain.Account, error) {
	rows, err := r.db.QueryContext(ctx, QListAccount)

	if err != nil {
		return nil, fmt.Errorf("list accounts: %w", err)
	}

	defer rows.Close()

	results := make([]domain.Account, 0, 10)

	var a domain.Account
	var reportingStartTs int64
	var reportingEndTs int64
	var openedOnTs int64
	for rows.Next() {
		err := rows.Scan(
			&a.Id,
			&a.PeriodId,
			&a.Name,
			&a.PeriodStartDay,
			&a.Balance,
			&reportingStartTs,
			&reportingEndTs,
			&openedOnTs,
		)
		if err != nil {
			return results, fmt.Errorf("scan list accounts: %w", err)
		}

		a.ReportingStartDisplay = time.UnixMilli(reportingStartTs).UTC().Format("02 Jan 2006")
		a.ReportingEndDisplay = time.UnixMilli(reportingEndTs).UTC().Format("02 Jan 2006")
		a.OpenedOnDisplay = time.UnixMilli(openedOnTs).UTC().Format("02 Jan 2006")
		results = append(results, a)
	}

	return results, nil
}

const QSingleAccount = `
	select a.id
	     , p.id as period_id
	     , a.name
	     , a.period_start_day
	     , coalesce(sum(t.amount), 0) as total_available
         , p.reporting_start_timestamp
         , p.reporting_end_timestamp
         , p.opened_on_timestamp
	from accounts a
	left join transactions t on a.id = t.account_id
	left join periods p on a.id = p.account_id
	where a.id = @id
	  and p.closed_on_timestamp is null
	  and (t.id is null or t.period_id = p.id)
	group by a.id, a.name
`

func (r *AccountRepo) Single(ctx context.Context, accountId int64) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx, QSingleAccount, sql.Named("id", accountId))

	var result domain.Account
	var reportingStartTs int64
	var reportingEndTs int64
	var openedOnTs int64
	err := row.Scan(
		&result.Id,
		&result.PeriodId,
		&result.Name,
		&result.PeriodStartDay,
		&result.Balance,
		&reportingStartTs,
		&reportingEndTs,
		&openedOnTs,
	)
	if err != nil {
		return result, fmt.Errorf("scan single account %d: %w", accountId, err)
	}

	result.ReportingStartDisplay = time.UnixMilli(reportingStartTs).UTC().Format("02 Jan 2006")
	result.ReportingEndDisplay = time.UnixMilli(reportingEndTs).UTC().Format("02 Jan 2006")
	result.OpenedOnDisplay = time.UnixMilli(openedOnTs).UTC().Format("02 Jan 2006")
	return result, nil
}

const QInsertAccount = `
	insert into accounts (name, period_start_day)
	values (@name, @period_start_day) 
	returning id, name, period_start_day
`

func (r *AccountRepo) Add(ctx context.Context, a domain.Account) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx, QInsertAccount,
		sql.Named("name", a.Name),
		sql.Named("period_start_day", a.PeriodStartDay),
	)

	var result domain.Account
	err := row.Scan(&result.Id, &result.Name, &result.PeriodStartDay)
	if err != nil {
		return result, fmt.Errorf("scan add account: %w", err)
	}

	return result, nil
}
