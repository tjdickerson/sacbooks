package service

import (
	"context"
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
