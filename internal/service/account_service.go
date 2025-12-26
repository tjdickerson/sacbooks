package service

import (
	"context"
	"time"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
)

type AccountService struct {
	accountRepo *repo.AccountRepo
	periodRepo *repo.PeriodRepo
}

func NewAccountService(accountRepo *repo.AccountRepo, periodRepo *repo.PeriodRepo) *AccountService {
	return &AccountService{
		accountRepo: accountRepo,
		periodRepo: periodRepo,
	}
}

func (as *AccountService) List(ctx context.Context) ([]domain.Account, error) {
	return as.accountRepo.List(ctx)
}

func (as *AccountService) Single(ctx context.Context, accountId int64) (domain.Account, error) {
	return as.accountRepo.Single(ctx, accountId)
}

func (as *AccountService) Add(ctx context.Context, name string, periodStartDay uint8) (domain.Account, error) {
	// TODO: check unique name?

	a := domain.Account {
		Name: name,
		PeriodStartDay: periodStartDay,
	}

	return as.accountRepo.Add(ctx, a)
}

func (as *AccountService) StartPeriod(ctx context.Context, accountId int64, startDay uint8, currentPeriod *domain.Period) error {
	var startTime time.Time
	var reportStart time.Time
	if currentPeriod == nil {
		t := time.Now().UTC()
		startTime = time.Date(t.Year(), t.Month(), int(startDay), 0, 0, 0, 0, time.UTC)
		reportStart = startTime
	} else {
		t := currentPeriod.ReportingStart
		startTime = time.Now().UTC();
		reportStart = time.Date(t.Year(), t.Month() + 1, int(startDay), 0, 0, 0, 0, time.UTC)
		// TODO: update current period to close it out.
	}
 
	return as.periodRepo.StartPeriod(ctx, accountId, reportStart, startTime)
}

func (as *AccountService) GetActivePeriod(ctx context.Context, accountId int64) (domain.Period, error) {
	return as.periodRepo.GetActivePeriod(ctx, accountId)
}
