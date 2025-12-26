package schema

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

var NoAccountError = errors.New("no account exists")

func Ensure(ctx context.Context, db *sql.DB) error {
	err := createSchema(ctx, db)
	if err != nil {
		return err
	}

	return checkAccountExists(ctx, db)
}

func checkAccountExists(ctx context.Context, db *sql.DB) error {
	row := db.QueryRowContext(ctx, "select count(1) from accounts")
	var count int

	err := row.Scan(&count)
	if err != nil {
		return fmt.Errorf("scan existing account: %w", err)
	}

	if count > 0 {
		return nil
	}
	
	return NoAccountError
}


func createSchema(ctx context.Context, db *sql.DB) error {
	if err := createTable(ctx, db, CreateTableAccounts); err != nil {
		return err
	}
	if err := createTable(ctx, db, CreatePeriodsTable); err != nil {
		return err
	}
	if err := createTable(ctx, db, CreateTableCategories); err != nil {
		return err
	}
	if err := createTable(ctx, db, CreateTableTransactions); err != nil {
		return err
	}
	if err := createTable(ctx, db, CreateTableRecurrings); err != nil {
		return err
	}
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
		actualized_recurring_id integer,
		period_id integer, 
		timestamp_added integer,
	    foreign key(account_id) references accounts(id),
	    foreign key(category_id) references categories(id),
	    foreign key(period_id) references periods(id),
		foreign key(actualized_recurring_id) references actualized_recurrings(id)
	);
`

const CreatePeriodsTable = `
	create table if not exists periods (
		id integer primary key,
		account_id integer, 
		reporting_start_timestamp integer,
		reporting_end_timestamp integer,
		opened_on_timestamp integer,
		closed_on_timestamp integer,
	    foreign key(account_id) references accounts(id)
	);
`

const CreateTableAccounts = `
	create table if not exists accounts (
		id integer primary key,
		period_start_day integer,
	    name varchar(100)
	);
`

const CreateTableAcrualizedRecurrings = `
	create table if not exists actualized_recurrings (
		id integer primary key,
		account_id integer,
		period_id integer,
		category_snapshot varchar(100),
		name_snapshot varchar(100),
		occurence_day_snapshot integer,
		amount_shapshot integer,
	    timestamp_created integer,
		foreign key(account_id) references accounts(id),
		foreign key(period_id) references periods(id)
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
