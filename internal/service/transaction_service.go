package service

import (
	"context"
	"time"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
)

type TransactionService struct {
	transactionRepo *repo.TransactionRepo
	accountRepo     *repo.AccountRepo
}

func NewTransactionService(transactionRepo *repo.TransactionRepo, accountRepo *repo.AccountRepo) *TransactionService {
	return &TransactionService{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

func (ts *TransactionService) List(ctx context.Context, accountId int64, limit int, offset int) ([]domain.Transaction, error) {
	return ts.transactionRepo.List(ctx, accountId, limit, offset)
}

func (ts *TransactionService) Add(ctx context.Context, accountId int64, name string, amount int64, date time.Time) (domain.Transaction, error) {
	return ts.transactionRepo.Add(ctx, domain.Transaction {
		AccountId: accountId,
		Name: name,
		Amount: amount,
		Date: date.UTC(),
	})
}
