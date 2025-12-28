package types

import "time"

type SimpleResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

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
	Id              int64     `json:"id"`
	Date            time.Time `json:"date"`
	DisplayDate     string    `json:"display_date"`
	Amount          int64     `json:"amount"`
	Name            string    `json:"name"`
	FromRecurringId int64     `json:"from_recurring_id"`
}

type AccountResult struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Data    Account `json:"data"`
}

type PeriodResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    Period `json:"data"`
}

type AccountListResult struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    []Account `json:"data"`
}

type Account struct {
	Id             int64  `json:"id"`
	Name           string `json:"name"`
	PeriodStartDay uint8  `json:"period_start_day"`
	CanDelete      bool   `json:"can_delete"`
	Period         Period `json:"period"`
}

type Period struct {
	Id             int64  `json:"id"`
	ReportingStart string `json:"reporting_start"`
	ReportingEnd   string `json:"reporting_end"`
	OpenedOn       string `json:"opened_on"`
	Balance        int64  `json:"balance"`
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
	Id                int64  `json:"id"`
	Name              string `json:"name"`
	Amount            int64  `json:"amount"`
	Day               uint8  `json:"day"`
	AccountedInPeriod bool   `json:"accounted_for"`
}

type TransactionUpdateInput struct {
	Id     int64  `json:"id"`
	Amount int64  `json:"amount"`
	Name   string `json:"name"`
}

type TransactionInsertInput struct {
	AccountId int64  `json:"account_id"`
	PeriodId  int64  `json:"period_id"`
	Amount    int64  `json:"amount"`
	Name      string `json:"name"`
}

type RecurringInput struct {
	Id     int64  `json:"id"`
	Amount int64  `json:"amount"`
	Name   string `json:"name"`
	Day    uint8  `json:"day"`
}

type AccountUpdateInput struct {
	Name           string `json:"name"`
	PeriodStartDay uint8  `json:"period_start_day"`
}
