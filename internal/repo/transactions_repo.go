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
	select t.id
	     , t.name
		 , t.amount
	     , t.transaction_date
	from transactions t
	where account_id = @account_id
	order by t.transaction_date desc
			,t.timestamp_added desc
		    ,t.id desc
	limit @limit offset @offset
`

func (r *TransactionRepo) List(ctx context.Context, accountId int64, limit int, offset int) ([]domain.Transaction, error) {
	stmt, err := r.db.Prepare(QPagedTransactions)
	if err != nil {
		return nil, fmt.Errorf("prepare list transactions: %w", err)
	}

	rows, err := stmt.QueryContext(ctx,
		sql.Named("account_id", accountId),
		sql.Named("limit", limit),
		sql.Named("offset", offset),
	)
	if err != nil {
		return nil, fmt.Errorf("query list transactions: %w", err)
	}

	defer rows.Close()

	transaction := domain.Transaction{}
	results := make([]domain.Transaction, 0, limit)
	var date int64
	var utcDate time.Time
	utc, _ := time.LoadLocation("UTC")

	for rows.Next() {
		err := rows.Scan(
			&transaction.Id,
			&transaction.Name,
			&transaction.Amount,
			&date,
		)
		if err != nil {
			return results, fmt.Errorf("scan list transactions: %w", err)
		}

		utcDate = time.UnixMilli(date).In(utc)
		transaction.Date = utcDate

		results = append(results, transaction)
	}

	return results, nil
}

const QSingleTransaction = `
	select t.id
		, t.name
		, t.amount
		, t.transaction_date
	 from transactions t
	where account_id = @account_id
	  and t.id = @transaction_id
`

func (r *TransactionRepo) Single(ctx context.Context, accountId int64, id int64) (domain.Transaction, error) {
	transaction := domain.Transaction{}
	stmt, err := r.db.PrepareContext(ctx, QSingleTransaction)
	if err != nil {
		return transaction, fmt.Errorf("prepare single transaction %d: %w", id, err)
	}

	utc, _ := time.LoadLocation("UTC")

	var dateMilis int64
	err = stmt.QueryRow(
		sql.Named("account_id", accountId),
		sql.Named("transaction_id", id),
	).Scan(&transaction.Id, &transaction.Name, &transaction.Amount, &dateMilis)

	transaction.Date = time.UnixMilli(dateMilis).In(utc)

	if err != nil {
		return transaction, fmt.Errorf("query single transaction %d: %w", id, err)
	}

	return transaction, nil
}

const QUpdateTransaction = `
	update transactions 
	set name = @name,
	    amount = @amount
	where id = @id;
`

func (r *TransactionRepo) Update(ctx context.Context, t *domain.Transaction) error {
	stmt, err := r.db.PrepareContext(ctx, QUpdateTransaction)
	if err != nil {
		return fmt.Errorf("prepare update transaction %d: %w", t.Id, err)
	}

	_, err = stmt.ExecContext(ctx,
		sql.Named("id", t.Id),
		sql.Named("name", t.Name),
		sql.Named("amount", t.Amount),
	)

	if err != nil {
		return fmt.Errorf("exec update transaction %d: %w", t.Id, err)
	}

	return nil
}

const QInsertTransaction = `
	insert into transactions (
		  account_id
		, name
	    , amount
	    , transaction_date
	    , timestamp_added)
	values (@account_id, @name, @amount, @transaction_date, @timestamp_added)
`

func (r *TransactionRepo) Insert(ctx context.Context, t *domain.Transaction) error {
	stmt, err := r.db.PrepareContext(ctx, QInsertTransaction)
	if err != nil {
		return fmt.Errorf("prepare insert transaction: %w", err)
	}

	result, err := stmt.ExecContext(ctx,
		sql.Named("account_id", t.AccountId),
		sql.Named("name", t.Name),
		sql.Named("amount", t.Amount),
		sql.Named("transaction_date", t.Date.UnixMilli()),
		sql.Named("timestamp_added", time.Now().UnixMilli()),
	)

	if err != nil {
		return fmt.Errorf("exec insert transaction: %w", err)
	}

	t.Id, err = result.LastInsertId()
	if err != nil {
		return fmt.Errorf("last insert transaction: %w", err)
	}

	return nil;
}


const QDeleteTransaction = `
	delete from transactions where id = @id
`

func (r *TransactionRepo) Delete(ctx context.Context, t *domain.Transaction) error {
	stmt, err := r.db.PrepareContext(ctx, QDeleteTransaction)
	if err != nil {
		return fmt.Errorf("prepare delete transaction %d: %w", t.Id, err)
	}

	_, err = stmt.ExecContext(ctx, sql.Named("id", t.Id))
	if err != nil {
		return fmt.Errorf("exec delete transaction %d: %w", t.Id, err)
	}
	return nil
}




