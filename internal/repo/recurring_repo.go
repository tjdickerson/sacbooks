package repo

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/domain"
)

type RecurringRepo struct {
	db *sql.DB
}

func NewRecurringsRepo(db *sql.DB) *RecurringRepo {
	return &RecurringRepo{db: db}
}

const QListRecurrings = `
	select ` + recurringColumns + ` from recurrings r
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

const QInsertRecurring = `
	insert into recurrings (
		  account_id
	    , name
	    , amount
	    , occurrence_day
	    , timestamp_added)
	values (@account_id, @name, @amount, @occurrence_day, @timestamp_added)
	returning id, account_id, name, amount, occurrence_day
`

func (r *RecurringRepo) Add(ctx context.Context, rt domain.Recurring) (domain.Recurring, error) {
	row := r.db.QueryRowContext(ctx, QInsertRecurring,
		sql.Named("account_id", rt.AccountId),
		sql.Named("name", rt.Name),
		sql.Named("amount", rt.Amount),
		sql.Named("occurrence_day", rt.Day),
		sql.Named("timestamp_added", time.Now().UnixMilli()),
	)

	return scanRecurring(row)
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

const QUpdateRecurring = `
	update recurrings
	set name = @name, occurrence_day = @day, amount = @amount
	where id = @id
	returning (id, account_id, name, amount, occurrence_day)
`

func (r *RecurringRepo) Update(ctx context.Context, rt domain.Recurring) (domain.Recurring, error) {
	row := r.db.QueryRowContext(ctx, QUpdateRecurring,
		sql.Named("id", rt.Id),
		sql.Named("name", rt.Name),
		sql.Named("day", rt.Day),
		sql.Named("amount", rt.Amount),
	)
	return scanRecurring(row)
}

const QDeleteRecurring = `
	delete from recurrings where id = @id
`

func (r *RecurringRepo) Delete(ctx context.Context, rt domain.Recurring) error {
	_, err := r.db.ExecContext(ctx, QDeleteRecurring, sql.Named("id", rt.Id))
	if err != nil {
		return fmt.Errorf("exec delete recurring %d: %w", rt.Id, err)
	}
	return nil
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
