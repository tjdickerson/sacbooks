package repo

import (
	"context"
	"database/sql"
	"fmt"
	"tjdickerson/sacbooks/internal/domain"
)

type RecurringRepo struct {
	db *sql.DB
}

func NewRecurringsRepo(db *sql.DB) *RecurringRepo {
	return &RecurringRepo{db: db}
}

const QListRecurrings = `
	select ` + recurringColumns +` from recurrings r
	where account_id = @account_id
	order by r.occurrence_day 
			,r.timestamp_added desc
`

func (r *RecurringRepo) List(ctx context.Context, accountId int64) ([]domain.Recurring, error) {
	result := make([]domain.Recurring, 0, 20)

	rows, err := r.db.QueryContext(ctx, QListRecurrings, sql.Named("account_id", accountId))
	if err != nil {
		return result, fmt.Errorf("query list recurrings: %w", err)
	}

	for rows.Next() {
		r, err := scanRecurring(rows)
		if err != nil {
			return result, fmt.Errorf("scan list recurring: %w", err)
		}

		result = append(result, r)
	}

	return result, nil
}

const QSingleRecurring = `
	select ` + recurringColumns + ` from
	recurrings r
	where r.id = @id
	`

func (r *RecurringRepo) Single(ctx context.Context, id int64) (domain.Recurring, error) {
	row := r.db.QueryRowContext(ctx, QSingleRecurring, sql.Named("id", id))
	return scanRecurring(row)
}

const recurringColumns = `
  r.id
, r.account_id
, r.name
, r.amount
, r.occurrence_day
`

func scanRecurring(row interface{ Scan(dest ...any) error }) (domain.Recurring, error) {
	var r domain.Recurring

	err := row.Scan(
		&r.Id,
		&r.AccountId,
		&r.Name,
		&r.Amount,
		&r.Day,
	)

	if err != nil {
		return r, fmt.Errorf("scan recurring: %w", err)
	}

	return r, nil
}
