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
	select r.id
		 , r.account_id
		 , r.category_id
		 , r.name
		 , r.amount
		 , r.occurrence_day
		 , (select count(1) from actualized_recurrings ar where ar.period_id = @period_id and ar.based_on_id = r.id) > 0 as accounted
     from recurrings r
	where account_id = @account_id
	order by r.occurrence_day 
			,r.timestamp_added desc
`

func (r *RecurringRepo) List(ctx context.Context, accountId int64, periodId int64) ([]domain.Recurring, error) {
	result := make([]domain.Recurring, 0, 20)

	rows, err := r.db.QueryContext(ctx, QListRecurrings,
		sql.Named("account_id", accountId),
		sql.Named("period_id", periodId),
	)
	if err != nil {
		return result, fmt.Errorf("query list recurrings: %w", err)
	}

	defer rows.Close()

	var rt domain.Recurring
	for rows.Next() {
		err := rows.Scan(&rt.Id, &rt.AccountId, &rt.CategoryId, &rt.Name, &rt.Amount, &rt.Day, &rt.AccountedInPeriod)
		if err != nil {
			return result, fmt.Errorf("scan list recurring: %w", err)
		}

		result = append(result, rt)
	}

	return result, nil
}

const QInsertRecurring = `
	insert into recurrings (
		  account_id
		, category_id
	    , name
	    , amount
	    , occurrence_day
	    , timestamp_added)
	values (@account_id, @category_id, @name, @amount, @occurrence_day, @timestamp_added)
	returning id, account_id, category_id, name, amount, occurrence_day
`

func (r *RecurringRepo) Add(ctx context.Context, rt domain.Recurring) (domain.Recurring, error) {
	row := r.db.QueryRowContext(ctx, QInsertRecurring,
		sql.Named("account_id", rt.AccountId),
		sql.Named("category_id", rt.CategoryId),
		sql.Named("name", rt.Name),
		sql.Named("amount", rt.Amount),
		sql.Named("occurrence_day", rt.Day),
		sql.Named("timestamp_added", time.Now().UnixMilli()),
	)

	err := row.Scan(&rt.Id, &rt.AccountId, &rt.CategoryId, &rt.Name, &rt.Amount, &rt.Day)
	if err != nil {
		return rt, fmt.Errorf("scan recurring: %w", err)
	}
	return rt, nil
}

const QSingleRecurring = `
	select r.id
	 	 , r.account_id 
	 	 , r.category_id 
		 , r.name
		 , r.amount
		 , r.occurrence_day
    from
	recurrings r
	where r.id = @id
`

func (r *RecurringRepo) Single(ctx context.Context, id int64) (domain.Recurring, error) {
	row := r.db.QueryRowContext(ctx, QSingleRecurring, sql.Named("id", id))
	var rt domain.Recurring
	err := row.Scan(&rt.Id, &rt.AccountId, &rt.CategoryId, &rt.Name, &rt.Amount, &rt.Day)
	if err != nil {
		return rt, fmt.Errorf("scan single recurring %d: %w", id, err)
	}
	return rt, err
}

const QUpdateRecurring = `
	update recurrings
	set category_id = @category_id, name = @name, occurrence_day = @day, amount = @amount
	where id = @id
	returning id, account_id, category_id, name, amount, occurrence_day
`

func (r *RecurringRepo) Update(ctx context.Context, rt domain.Recurring) (domain.Recurring, error) {
	row := r.db.QueryRowContext(ctx, QUpdateRecurring,
		sql.Named("id", rt.Id),
		sql.Named("category_id", rt.CategoryId),
		sql.Named("name", rt.Name),
		sql.Named("day", rt.Day),
		sql.Named("amount", rt.Amount),
	)

	err := row.Scan(&rt.Id, &rt.AccountId, &rt.CategoryId, &rt.Name, &rt.Amount, &rt.Day)
	if err != nil {
		return rt, fmt.Errorf("scan update recurring %d: %w", rt.Id, err)
	}
	return rt, nil
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

const QInsertActualizedRecurring = `
	insert into actualized_recurrings (account_id, period_id, based_on_id, name_snapshot, amount_snapshot, occurrence_day_snapshot, timestamp_created)
	values (@account_id, @period_id, @based_on_id, @name, @amount, @day, @date)
	returning id, account_id, period_id, name_snapshot, amount_snapshot, occurrence_day_snapshot
`

// ActualizeRecurring Returns ActualizedRecurring record, category id from the source recurring record, and any error.
func (r *RecurringRepo) ActualizeRecurring(ctx context.Context, recurringId int64, periodId int64) (domain.ActualizedRecurring, int64, error) {
	var ar domain.ActualizedRecurring
	rt, err := r.Single(ctx, recurringId)
	if err != nil {
		return ar, 0, fmt.Errorf("actualize recurring %d: %w", recurringId, err)
	}

	ar.Date = time.Now().UTC()
	ar.AccountId = rt.AccountId
	ar.PeriodId = periodId
	ar.Name = rt.Name
	ar.Amount = rt.Amount
	ar.Day = rt.Day

	row := r.db.QueryRowContext(ctx, QInsertActualizedRecurring,
		sql.Named("account_id", ar.AccountId),
		sql.Named("period_id", ar.PeriodId),
		sql.Named("based_on_id", recurringId),
		sql.Named("name", ar.Name),
		sql.Named("amount", ar.Amount),
		sql.Named("day", ar.Day),
		sql.Named("date", ar.Date.UnixMilli()))

	err = row.Scan(&ar.Id, &ar.AccountId, &ar.PeriodId, &ar.Name, &ar.Amount, &ar.Day)
	return ar, rt.CategoryId, err
}
