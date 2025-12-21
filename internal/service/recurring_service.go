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

func (rs *RecurringService) List(ctx context.Context, accountId int64) ([]domain.Recurring, error) {
	return rs.recurringRepo.List(ctx, accountId)
}
