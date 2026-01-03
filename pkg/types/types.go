package types

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
	Id              int64  `json:"id"`
	CategoryId      int64  `json:"category_id"`
	Date            int64  `json:"date"`
	DisplayDate     string `json:"display_date"`
	Amount          int64  `json:"amount"`
	Name            string `json:"name"`
	FromRecurringId int64  `json:"from_recurring_id"`
}

type TransactionUpdateInput struct {
	Id         int64  `json:"id"`
	Date       int64  `json:"date"`
	Amount     int64  `json:"amount"`
	CategoryId int64  `json:"category_id"`
	Name       string `json:"name"`
}

type TransactionInsertInput struct {
	AccountId  int64  `json:"account_id"`
	PeriodId   int64  `json:"period_id"`
	CategoryId int64  `json:"category_id"`
	Date       int64  `json:"date"`
	Amount     int64  `json:"amount"`
	Name       string `json:"name"`
}

type Period struct {
	Id             int64  `json:"id"`
	ReportingStart string `json:"reporting_start"`
	ReportingEnd   string `json:"reporting_end"`
	OpenedOn       string `json:"opened_on"`
	Balance        int64  `json:"balance"`
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
	ActivePeriod   Period `json:"active_period"`
}

type AccountResult struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Data    Account `json:"data"`
}

type AccountUpdateInput struct {
	Name           string `json:"name"`
	PeriodStartDay uint8  `json:"period_start_day"`
}

type Recurring struct {
	Id                int64  `json:"id"`
	Name              string `json:"name"`
	Amount            int64  `json:"amount"`
	CategoryId        int64  `json:"category_id"`
	Day               uint8  `json:"day"`
	AccountedInPeriod bool   `json:"accounted_for"`
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

type RecurringInput struct {
	Id         int64  `json:"id"`
	Amount     int64  `json:"amount"`
	CategoryId int64  `json:"category_id"`
	Name       string `json:"name"`
	Day        uint8  `json:"day"`
}

type Category struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

type CategoryResult struct {
	Success bool     `json:"success"`
	Message string   `json:"message"`
	Data    Category `json:"data"`
}

type CategoryListResult struct {
	Success bool       `json:"success"`
	Message string     `json:"message"`
	Data    []Category `json:"data"`
}

type CategoryInsertInput struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type CategoryUpdateInput struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}
