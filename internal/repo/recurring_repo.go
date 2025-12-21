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
	select rt.id
	     , rt.name
		 , rt.amount
	     , rt.occurrence_day
	from recurrings rt
	where account_id = @account_id
	order by rt.occurrence_day 
			,rt.timestamp_added desc
`

func (r *RecurringRepo) List(ctx context.Context, accountId int64) ([]domain.Recurring, error) {
	result := make([]domain.Recurring, 0, 20)

	stmt, err := r.db.PrepareContext(ctx, QListRecurrings)
	if err != nil {
		return result, fmt.Errorf("prepare list recurrings: %w", err)
	}

	rows, err := stmt.QueryContext(ctx, sql.Named("account_id", accountId))
	if err != nil {
		return result, fmt.Errorf("query list recurrings: %w", err)
	}

	recurring := domain.Recurring{}
	for rows.Next() {
		err = rows.Scan(&recurring.Id, &recurring.Name, &recurring.Amount, &recurring.Day)	
		if err != nil {
			return result, fmt.Errorf("scan list recurring: %w", err)
		}

		result = append(result, recurring)
	}

	return result, nil
}

