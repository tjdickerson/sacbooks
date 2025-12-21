package types

import "time"

type Result[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Object  T      `json:"data"`
}

func Ok[T any](v T) Result[T] {
	return Result[T]{Success: true, Object: v}
}

func Fail[T any](msg string) Result[T] {
	return Result[T]{Success: false, Message: msg}
}

type TransactionResult struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    Transaction `json:"data"`
}

type TransactionListResult struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Data    []Transaction `json:"data"`
}

type Transaction struct {
	Id          int64     `json:"id"`
	Date        time.Time `json:"date"`
	DisplayDate string    `json:"display_date"`
	Amount      int64     `json:"amount"`
	Name        string    `json:"name"`
}

type AccountResult struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Data    Account `json:"data"`
}

type AccountListResult struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    []Account `json:"data"`
}

type Account struct {
	Id      int64  `json:"id"`
	Name    string `json:"name"`
	Balance int64  `json:"balance"`
}

type RecurringResult struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    Recurring `json:"data"`
}

type RecurringListResult struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    []Recurring `json:"data"`
}

type Recurring struct {
	Id     int64  `json:"id"`
	Name   string `json:"name"`
	Amount int64  `json:"amount"`
	Day    uint8  `json:"day"`
}

type TransactionInput struct {
	Id     int64  `json:"id"`
	Amount int64  `json:"amount"`
	Name   string `json:"name"`
}
