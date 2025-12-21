package service

import (
	"context"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
)

type AccountService struct {
	accountRepo *repo.AccountRepo
}

func NewAccountService(accountRepo *repo.AccountRepo) *AccountService {
	return &AccountService{
		accountRepo: accountRepo,
	}
}

func (as *AccountService) Single(ctx context.Context, accountId int64) (domain.Account, error) {
	return as.accountRepo.Single(ctx, accountId)
}
