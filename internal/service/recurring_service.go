package service

import (
	"context"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
)

type RecurringService struct {
	recurringRepo *repo.RecurringRepo
}

func NewRecurringService(recurringRepo *repo.RecurringRepo) *RecurringService {
	return &RecurringService{
		recurringRepo: recurringRepo,
	}
}

func (rs *RecurringService) Add(ctx context.Context, accountId int64, name string, amount int64, day uint8) (domain.Recurring, error) {
	temp := domain.Recurring {
		AccountId: accountId,
		Name: name,
		Amount: amount,
		Day: day,
	}
	return rs.recurringRepo.Add(ctx, temp)

}

func (rs *RecurringService) List(ctx context.Context, accountId int64) ([]domain.Recurring, error) {
	return rs.recurringRepo.List(ctx, accountId)
}
