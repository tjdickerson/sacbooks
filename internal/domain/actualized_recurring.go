package domain

import "time"

type ActualizedRecurring struct {
	Id        int64
	AccountId int64
	PeriodId  int64
	Name      string
	Amount    int64
	Day       uint8
	Date      time.Time
}
