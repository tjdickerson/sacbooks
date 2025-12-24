package repo

import (
	"context"
	"database/sql"
	"fmt"
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
	     , a.name
	     , coalesce(sum(t.amount), 0) as total_available
	from accounts a
	left join transactions t on a.id = t.account_id
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
	for rows.Next() {
		err := rows.Scan(&a.Id, &a.Name, &a.Balance)
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
	     , coalesce(sum(t.amount), 0) as total_available
	from accounts a
	left join transactions t on a.id = t.account_id
	where a.id = @id
	group by a.id, a.name
`

func (r *AccountRepo) Single(ctx context.Context, accountId int64) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx, QSingleAccount, sql.Named("id", accountId))

	var result domain.Account
	err := row.Scan(&result.Id, &result.Name, &result.Balance)
	if err != nil {
		return result, fmt.Errorf("scan single account %d: %w", accountId, err)
	}

	return result, nil
}

const QInsertAccount = `
	insert into accounts (
		name)
	values (@name) 
	returning id, name
`

func (r *AccountRepo) Add(ctx context.Context, a domain.Account) (domain.Account, error) {
	row := r.db.QueryRowContext(ctx, QInsertAccount,
		sql.Named("name", a.Name),
	)

	var result domain.Account
	err := row.Scan(&result.Id, &result.Name)
	if err != nil {
		return result, fmt.Errorf("scan add account: %w", err)
	}

	return result, nil
}

