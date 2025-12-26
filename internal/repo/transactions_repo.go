package repo

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/domain"
)

type TransactionRepo struct {
	db *sql.DB
}

func NewTransactionRepo(db *sql.DB) *TransactionRepo {
	return &TransactionRepo{db: db}
}

const QPagedTransactions = `
	select ` + transactionColumns + ` from transactions t
	where account_id = @account_id
	order by t.transaction_date desc
			,t.timestamp_added desc
		    ,t.id desc
	limit @limit offset @offset
`

func (r *TransactionRepo) List(ctx context.Context, accountId int64, limit int, offset int) ([]domain.Transaction, error) {
	rows, err := r.db.QueryContext(ctx, QPagedTransactions,
		sql.Named("account_id", accountId),
		sql.Named("limit", limit),
		sql.Named("offset", offset),
	)

	if err != nil {
		return nil, fmt.Errorf("query list transactions: %w", err)
	}

	defer rows.Close()

	results := make([]domain.Transaction, 0, limit)

	for rows.Next() {
		t, err := scanTransaction(rows)
		if err != nil {
			return results, fmt.Errorf("scan list transactions: %w", err)
		}

		results = append(results, t)
	}

	return results, nil
}

const QSingleTransaction = `
	select ` + transactionColumns + ` from transactions t
	where t.id = @transaction_id
`

func (r *TransactionRepo) Single(ctx context.Context, id int64) (domain.Transaction, error) {
	row := r.db.QueryRowContext(ctx, QSingleTransaction, sql.Named("transaction_id", id))
	transaction, err := scanTransaction(row)

	if err != nil {
		return transaction, fmt.Errorf("query single transaction %d: %w", id, err)
	}

	return transaction, nil
}

const QUpdateTransaction = `
	update transactions 
	set name = @name,
	    amount = @amount,
	    category_id = @category_id
	where id = @id
	returning ` + transactionColumnsNoAlias

func (r *TransactionRepo) Update(ctx context.Context, t domain.Transaction) (domain.Transaction, error) {
	row := r.db.QueryRowContext(ctx, QUpdateTransaction,
		sql.Named("id", t.Id),
		sql.Named("name", t.Name),
		sql.Named("amount", t.Amount),
		sql.Named("category_id", t.CategoryId),
	)

	return scanTransaction(row)
}

const QInsertTransaction = `
	insert into transactions (
	      transaction_date
	    , amount
		, name
		, account_id
	    , category_id
	    , actualized_recurring_id
	    , period_id
	    , timestamp_added)
	values (
		@transaction_date, 
		@amount, 
		@name, 
		@account_id, 
		@category_id,
		@actualized_recurring_id,
		@period_id
		@timestamp_added)
	returning ` + transactionColumnsNoAlias

func (r *TransactionRepo) Add(ctx context.Context, t domain.Transaction) (domain.Transaction, error) {
	row := r.db.QueryRowContext(ctx, QInsertTransaction,
		sql.Named("transaction_date", t.Date.UnixMilli()),
		sql.Named("amount", t.Amount),
		sql.Named("name", t.Name),
		sql.Named("account_id", t.AccountId),
		sql.Named("category_id", t.CategoryId),
		sql.Named("actualized_recurring_id", t.ActualizedRecurringId),
		sql.Named("period_id", t.PeriodId),
		sql.Named("timestamp_added", time.Now().UnixMilli()),
	)

	return scanTransaction(row)
}

const QDeleteTransaction = `
	delete from transactions where id = @id
`

func (r *TransactionRepo) Delete(ctx context.Context, t domain.Transaction) error {
	_, err := r.db.ExecContext(ctx, QDeleteTransaction, sql.Named("id", t.Id))
	if err != nil {
		return fmt.Errorf("exec delete transaction %d: %w", t.Id, err)
	}
	return nil
}

const transactionColumns = `
  t.id
, t.account_id
, t.name
, t.amount
, t.transaction_date
, t.period_id
, t.actualized_recurring_id
`

const transactionColumnsNoAlias = `
  id
, account_id
, name
, amount
, transaction_date
, period_id
, actualized_recurring_id
`

func scanTransaction(row interface{ Scan(dest ...any) error }) (domain.Transaction, error) {
	var t domain.Transaction
	var dateMillis int64

	err := row.Scan(
		&t.Id,
		&t.AccountId,
		&t.Name,
		&t.Amount,
		&dateMillis,
		&t.PeriodId,
		&t.ActualizedRecurringId,
	)

	if err != nil {
		return t, fmt.Errorf("scan transaction: %w", err)
	}

	t.Date = time.UnixMilli(dateMillis).UTC()
	return t, nil
}
