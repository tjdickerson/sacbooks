package schema

import (
	"context"
	"database/sql"
	"fmt"
)

func Ensure(ctx context.Context, db *sql.DB) error {
	return createSchema(ctx, db)
}

func createSchema(ctx context.Context, db *sql.DB) error {
	if err := createTable(ctx, db, CreateTableAccounts); err != nil {return err}
	if err := createTable(ctx, db, CreateTableCategories); err != nil {return err}
	if err := createTable(ctx, db, CreateTableTransactions); err != nil {return err}
	if err := createTable(ctx, db, CreateTableRecurrings); err != nil {return err}
	return nil
}

func createTable(ctx context.Context, db *sql.DB, statement string) error {
	stmt, err := db.PrepareContext(ctx, statement)
	if err != nil {
		return fmt.Errorf("prepare create table [%s]: %w", statement, err)
	}

	_, err = stmt.ExecContext(ctx)
	if err != nil {
		return fmt.Errorf("exec create table [%s]: %w", statement, err)
	}

	return nil
}

const CreateTableTransactions = `
	create table if not exists transactions (
		id integer primary key,
		transaction_date integer,
		amount integer,
	    name varchar(1000),
	    account_id integer,
	    category_id integer,
		timestamp_added integer,
	    foreign key(account_id) references accounts(id),
	    foreign key(category_id) references categories(id)
	);
`

const CreateTableAccounts = `
	create table if not exists accounts (
		id integer primary key,
	    name varchar(100)
	);
`

const CreateTableRecurrings = `
	create table if not exists recurrings (
		id integer primary key,
		account_id integer,
		category_id integer,
		name varchar(100),
		occurrence_day integer,
		amount integer,
	    timestamp_added integer,
		foreign key(account_id) references accounts(id),
		foreign key(category_id) references categories(id)
	);
`

const CreateTableCategories = `
	create table if not exists categories (
		id integer primary key,
		account_id integer
		name varchar(100),
		foreign key(account_id) references accounts(id)
	);
`
