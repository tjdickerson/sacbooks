package repo

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"tjdickerson/sacbooks/internal/domain"
)

type CategoryRepo struct {
	db *sql.DB
}

func NewCategoryRepo(sb *sql.DB) *CategoryRepo {
	return &CategoryRepo{db: sb}
}

const QListCategories = `
	select id, name, color from categories
	where account_id = @account_id
`

func (r *CategoryRepo) List(ctx context.Context, accountId int64) ([]domain.Category, error) {
	rows, err := r.db.QueryContext(ctx, QListCategories, sql.Named("account_id", accountId))
	if err != nil {
		return nil, fmt.Errorf("list categories: %w", err)
	}

	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Printf("Failed to close rows in categories.list")
		}
	}(rows)

	var cat domain.Category
	list := make([]domain.Category, 0, 10)
	for rows.Next() {
		err = rows.Scan(&cat.Id, &cat.Name, &cat.Color)
		if err != nil {
			return list, fmt.Errorf("scan list categories: %w", err)
		}

		list = append(list, cat)
	}

	return list, nil
}

const QSingleCategory = `
select id, account_id, name, color 
from categories
where id = @id
`

func (r *CategoryRepo) Single(ctx context.Context, categoryId int64) (domain.Category, error) {
	var c domain.Category
	row := r.db.QueryRowContext(ctx, QSingleCategory, sql.Named("id", categoryId))

	err := row.Scan(&c.Id, &c.AccountId, &c.Name, &c.Color)
	if err != nil {
		return c, fmt.Errorf("scan single category: %w", err)
	}

	return c, nil
}

const QInsertCategory = `
insert into categories (name, account_id, color)
values (@name, @account_id, @color)
returning id, name, account_id, color
`

func (r *CategoryRepo) Add(ctx context.Context, c domain.Category) (domain.Category, error) {
	row := r.db.QueryRowContext(ctx, QInsertCategory,
		sql.Named("name", c.Name),
		sql.Named("account_id", c.AccountId),
		sql.Named("color", c.Color),
	)

	err := row.Scan(&c.Id, &c.Name, &c.AccountId, &c.Color)
	if err != nil {
		return c, fmt.Errorf("add category: %w", err)
	}

	return c, nil
}

const QUpdateCategory = `
update categories 
set name = @name, 
	account_id = @account_id, 
	color = @color
where id = @id
returning id, name, account_id, color
`

func (r *CategoryRepo) Update(ctx context.Context, c domain.Category) (domain.Category, error) {
	row := r.db.QueryRowContext(ctx, QUpdateCategory,
		sql.Named("id", c.Id),
	)

	err := row.Scan(&c.Id, &c.Name, &c.AccountId, &c.Color)
	if err != nil {
		return c, fmt.Errorf("add category: %w", err)
	}

	return c, nil
}

const QDeleteCategory = `
delete from categories where id = @id
`

func (r *CategoryRepo) Delete(ctx context.Context, categoryId int64) error {
	_, err := r.db.ExecContext(ctx, QDeleteCategory, sql.Named("id", categoryId))
	if err != nil {
		return fmt.Errorf("delete category: %w", err)
	}

	return nil
}
