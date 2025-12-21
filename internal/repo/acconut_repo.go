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
	result := domain.Account{}
	stmt, err := r.db.PrepareContext(ctx, QSingleAccount)
	if err != nil {
		return result, fmt.Errorf("prepare get account %d: %w", accountId, err)
	}

	row := stmt.QueryRowContext(ctx, sql.Named("id", accountId))

	err = row.Scan(&result.Id, &result.Name, &result.Balance)
	if err != nil {
		return result, fmt.Errorf("scan single account %d: %w", accountId, err)
	}

	return result, nil
}
