package service

import (
	"context"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
	"tjdickerson/sacbooks/pkg/types"
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

func (ts *TransactionService) List(ctx context.Context, accountId int64, periodId int64, limit int, offset int) ([]domain.Transaction, error) {
	return ts.transactionRepo.List(ctx, accountId, periodId, limit, offset)
}

func (ts *TransactionService) Add(ctx context.Context, input types.TransactionInsertInput) (domain.Transaction, error) {
	return ts.transactionRepo.Add(ctx, domain.Transaction{
		AccountId: input.AccountId,
		Name:      input.Name,
		Amount:    input.Amount,
		PeriodId:  input.PeriodId,
		Date:      time.Now().UTC(),
	})
}

func (ts *TransactionService) Update(ctx context.Context, input types.TransactionUpdateInput) (domain.Transaction, error) {
	transaction, err := ts.transactionRepo.Single(ctx, input.Id)
	if err != nil {
		return transaction, fmt.Errorf("update transaction %d: %w", input.Id, err)
	}

	transaction.Name = input.Name
	transaction.Amount = input.Amount

	return ts.transactionRepo.Update(ctx, transaction)
}

func (ts *TransactionService) Delete(ctx context.Context, transactionId int64) error {
	transaction, err := ts.transactionRepo.Single(ctx, transactionId)
	if err != nil {
		return fmt.Errorf("delete transaction %d: %w", transactionId, err)
	}

	return ts.transactionRepo.Delete(ctx, transaction)
}

func (ts *TransactionService) ApplyRecurring(ctx context.Context, recurringId int64, periodId int64) (domain.Transaction, error) {
	recurring, err := ts.recurringRepo.ActualizeRecurring(ctx, recurringId, periodId)

	if err != nil {
		return domain.Transaction{}, fmt.Errorf("apply recurring: %w", err)
	}

	return ts.transactionRepo.Add(ctx, domain.Transaction{
		AccountId:             recurring.AccountId,
		Name:                  recurring.Name,
		Amount:                recurring.Amount,
		PeriodId:              periodId,
		ActualizedRecurringId: recurring.Id,
		Date:                  time.Now().UTC(),
	})
}
