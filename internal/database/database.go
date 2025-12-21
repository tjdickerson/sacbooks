package database

import (
	"database/sql"
	"errors"
	"fmt"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func Startup(dbPath string) (*sql.DB, error) {
	_, existErr := os.Stat(dbPath)
	if errors.Is(existErr, os.ErrNotExist) {
		db, err := sql.Open("sqlite3", dbPath)
		if err != nil {
			panic(fmt.Sprintf("Couldn't create the database: %s\n", err))
		}
		db.Close()
	}

	db, err := sql.Open("sqlite3", dbPath+"?cache=shared")
	db.SetMaxOpenConns(1)

	return db, err
}

func Shutdown(db *sql.DB) error {
	if db != nil {
		if err := db.Close(); err != nil {
			return fmt.Errorf("shutdown database: %w", err)
		}
		return nil
	}
	return nil
}


