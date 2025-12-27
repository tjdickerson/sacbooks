package domain

import "time"

type Transaction struct {
	Id                    int64
	AccountId             int64
	PeriodId              int64
	CategoryId            int64
	Name                  string
	Amount                int64
	ActualizedRecurringId int64
	Date                  time.Time
	CanDelete             bool
}
