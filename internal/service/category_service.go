package service

import (
	"context"
	"fmt"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
	"tjdickerson/sacbooks/pkg/types"
)

type CategoryService struct {
	categoryRepo *repo.CategoryRepo
}

func NewCategoryService(categoryRepo *repo.CategoryRepo) *CategoryService {
	return &CategoryService{
		categoryRepo: categoryRepo,
	}
}

func (cs *CategoryService) List(ctx context.Context, accountId int64) ([]domain.Category, error) {
	return cs.categoryRepo.List(ctx, accountId)
}

func (cs *CategoryService) Single(ctx context.Context, categoryId int64) (domain.Category, error) {
	return cs.categoryRepo.Single(ctx, categoryId)
}

func (cs *CategoryService) Add(ctx context.Context, accountId int64, input types.CategoryInsertInput) (domain.Category, error) {
	c := domain.Category{
		AccountId: accountId,
		Name:      input.Name,
		Color:     input.Color,
	}
	return cs.categoryRepo.Add(ctx, c)
}

func (cs *CategoryService) Update(ctx context.Context, accountId int64, input types.CategoryUpdateInput) (domain.Category, error) {
	c, err := cs.categoryRepo.Single(ctx, input.Id)
	if err != nil {
		return c, fmt.Errorf("unable to get category %d: %w", input.Id, err)
	}

	if c.AccountId != accountId {
		return c, fmt.Errorf("invalid account id %d for category %d: %w", accountId, c.Id, err)
	}

	c.Name = input.Name
	c.Color = input.Color

	c, err = cs.categoryRepo.Update(ctx, c)
	if err != nil {
		return c, fmt.Errorf("unable to update category %s: %w", input.Id, err)
	}

	return c, nil
}

func (cs *CategoryService) Delete(ctx context.Context, categoryId int64) error {
	return cs.categoryRepo.Delete(ctx, categoryId)
}
