package domain

import "time"

type Transaction struct {
	Id        int64
	AccountId int64
	Name      string
	Amount    int64
	Date      time.Time
}
