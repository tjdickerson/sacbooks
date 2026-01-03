package service

import (
	"context"
	"fmt"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
	"tjdickerson/sacbooks/pkg/types"
)

type RecurringService struct {
	recurringRepo *repo.RecurringRepo
}

func NewRecurringService(recurringRepo *repo.RecurringRepo) *RecurringService {
	return &RecurringService{
		recurringRepo: recurringRepo,
	}
}

func (rs *RecurringService) Add(ctx context.Context, accountId int64, name string, amount int64, day uint8, categoryId int64) (domain.Recurring, error) {
	temp := domain.Recurring{
		AccountId:  accountId,
		CategoryId: categoryId,
		Name:       name,
		Amount:     amount,
		Day:        day,
	}
	return rs.recurringRepo.Add(ctx, temp)
}

func (rs *RecurringService) List(ctx context.Context, accountId int64, periodId int64) ([]domain.Recurring, error) {
	return rs.recurringRepo.List(ctx, accountId, periodId)
}

func (rs *RecurringService) Update(ctx context.Context, input types.RecurringInput) (domain.Recurring, error) {
	r, err := rs.recurringRepo.Single(ctx, input.Id)
	if err != nil {
		return r, fmt.Errorf("update recurring %d: %w", input.Id, err)
	}

	r.Name = input.Name
	r.Amount = input.Amount

	return rs.recurringRepo.Update(ctx, r)
}

func (rs *RecurringService) Delete(ctx context.Context, recurringId int64) error {
	recurring, err := rs.recurringRepo.Single(ctx, recurringId)
	if err != nil {
		return fmt.Errorf("delete recurring %d: %w", recurringId, err)
	}

	return rs.recurringRepo.Delete(ctx, recurring)
}
