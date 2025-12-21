package domain


type Recurring struct {
	Id     int64
	AccountId int64
	Name   string
	Day    uint8
	Amount int64
}
