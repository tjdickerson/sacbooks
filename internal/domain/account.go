package domain

type Account struct {
	Id                    int64
	PeriodId              int64
	Name                  string
	Balance               int64
	PeriodStartDay        uint8
	ReportingStartDisplay string
	ReportingEndDisplay   string
	OpenedOnDisplay       string
}
