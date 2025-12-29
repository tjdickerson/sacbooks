package domain

type Account struct {
	Id             int64
	Name           string
	PeriodStartDay uint8
	CanDelete      bool
	ActivePeriod   *Period
}
