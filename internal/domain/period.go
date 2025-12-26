package domain

import "time"

type Period struct {
	Id             int64
	AccountId      int64
	ReportingStart time.Time
	ReportingEnd   time.Time
	OpenedOn       time.Time
	ClosedOn       time.Time
}
