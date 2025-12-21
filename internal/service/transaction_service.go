package service

import (
	"context"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
)

type TransactionService struct {
	transactionRepo *repo.TransactionRepo
	recurringRepo   *repo.RecurringRepo
	accountRepo     *repo.AccountRepo
}

func NewTransactionService(transactionRepo *repo.TransactionRepo, recurringRepo *repo.RecurringRepo, accountRepo *repo.AccountRepo) *TransactionService {
	return &TransactionService{
		transactionRepo: transactionRepo,
		recurringRepo:   recurringRepo,
		accountRepo:     accountRepo,
	}
}

func (ts *TransactionService) List(ctx context.Context, accountId int64, limit int, offset int) ([]domain.Transaction, error) {
	return ts.transactionRepo.List(ctx, accountId, limit, offset)
}

func (ts *TransactionService) Add(ctx context.Context, accountId int64, name string, amount int64, date time.Time) (domain.Transaction, error) {
	return ts.transactionRepo.Add(ctx, domain.Transaction{
		AccountId: accountId,
		Name:      name,
		Amount:    amount,
		Date:      date.UTC(),
	})
}

func (ts *TransactionService) ApplyRecurring(ctx context.Context, recurringId int64) (domain.Transaction, error) {
	recurring, err := ts.recurringRepo.Single(ctx, recurringId)

	if err != nil {
		return domain.Transaction{}, fmt.Errorf("applying recurring: %w", err)
	}

	return ts.Add(ctx, recurring.AccountId, recurring.Name, recurring.Amount, time.Now().UTC())
}
