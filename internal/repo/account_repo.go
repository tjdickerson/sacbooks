package repo

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"tjdickerson/sacbooks/internal/domain"
)

type AccountRepo struct {
	db *sql.DB
}

func NewAccountRepo(db *sql.DB) *AccountRepo {
	return &AccountRepo{db: db}
}

var ErrorCantDeleteAccount = fmt.Errorf("can't delete account")

const QListAccount = `
select a.id
     , a.name
     , a.period_start_day
     , a.can_delete
from accounts a
order by a.id 
`

func (r *AccountRepo) List(ctx context.Context) ([]domain.Account, error) {
	rows, err := r.db.QueryContext(ctx, QListAccount)

	if err != nil {
		return nil, fmt.Errorf("list accounts: %w", err)
	}

	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Printf("error closing rows in list accounts: %v\n", err)
		}
	}(rows)

	results := make([]domain.Account, 0, 10)

	var a domain.Account
	for rows.Next() {
		err := rows.Scan(
			&a.Id,
			&a.Name,
			&a.PeriodStartDay,
			&a.CanDelete,
		)
		if err != nil {
			return results, fmt.Errorf("scan list accounts: %w", err)
		}

		results = append(results, a)
	}

	return results, nil
}

const QSingleAccount = `
	select a.id
	     , a.name
	     , a.period_start_day
	     , a.can_delete
	from accounts a
	where a.id = @id
`

func (r *AccountRepo) Single(ctx context.Context, accountId int64) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx, QSingleAccount, sql.Named("id", accountId))

	var result domain.Account
	err := row.Scan(
		&result.Id,
		&result.Name,
		&result.PeriodStartDay,
		&result.CanDelete,
	)
	if err != nil {
		return result, fmt.Errorf("scan single account %d: %w", accountId, err)
	}

	return result, nil
}

const QInsertAccount = `
	insert into accounts (name, period_start_day, can_delete)
	values (@name, @period_start_day, @can_delete) 
	returning id, name, period_start_day
`

func (r *AccountRepo) Add(ctx context.Context, a domain.Account) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx, QInsertAccount,
		sql.Named("name", a.Name),
		sql.Named("period_start_day", a.PeriodStartDay),
		sql.Named("can_delete", a.CanDelete),
	)

	var result domain.Account
	err := row.Scan(&result.Id, &result.Name, &result.PeriodStartDay)
	if err != nil {
		return result, fmt.Errorf("scan add account: %w", err)
	}

	return result, nil
}

const QUpdateAccount = `
	update accounts set name = @name, period_start_day = @period_start_day, can_delete = @can_delete
	where id = @id
	returning id, name, period_start_day, can_delete
`

func (r *AccountRepo) Update(ctx context.Context, a domain.Account) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx, QUpdateAccount,
		sql.Named("id", a.Id),
		sql.Named("name", a.Name),
		sql.Named("period_start_day", a.PeriodStartDay),
		sql.Named("can_delete", a.CanDelete),
	)

	err := row.Scan(&a.Id, &a.Name, &a.PeriodStartDay, &a.CanDelete)
	if err != nil {
		return a, fmt.Errorf("update account %d: %w", a.Id, err)
	}

	return a, nil
}

const QDeleteAccount = `
	delete from accounts where id = @id
`

func (r *AccountRepo) Delete(ctx context.Context, a domain.Account) error {
	if !a.CanDelete {
		return ErrorCantDeleteAccount
	}
	_, err := r.db.ExecContext(ctx, QDeleteAccount, sql.Named("id", a.Id))
	if err != nil {
		return fmt.Errorf("exec delete account %d: %w", a.Id, err)
	}
	return nil
}
