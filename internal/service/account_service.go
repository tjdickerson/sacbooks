package service

import (
	"context"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
	"tjdickerson/sacbooks/pkg/types"
)

type AccountService struct {
	accountRepo     *repo.AccountRepo
	periodRepo      *repo.PeriodRepo
	transactionRepo *repo.TransactionRepo
}

func NewAccountService(accountRepo *repo.AccountRepo, periodRepo *repo.PeriodRepo, transactionRepo *repo.TransactionRepo) *AccountService {
	return &AccountService{
		accountRepo:     accountRepo,
		periodRepo:      periodRepo,
		transactionRepo: transactionRepo,
	}
}

func (as *AccountService) List(ctx context.Context) ([]domain.Account, error) {
	list, err := as.accountRepo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list accounts: %w", err)
	}

	// todo: once the functionality is settles, revisit this. Could combine into one query.
	for i := range list {
		p, err := as.GetActivePeriod(ctx, list[i].Id)
		if err != nil {
			return nil, fmt.Errorf("get active period for account %d: %w", list[i].Id, err)
		}
		list[i].Period = &p
	}

	return list, nil
}

func (as *AccountService) Single(ctx context.Context, accountId int64) (domain.Account, error) {
	a, err := as.accountRepo.Single(ctx, accountId)
	if err != nil {
		return a, fmt.Errorf("get account %d: %w", accountId, err)
	}

	p, err := as.GetActivePeriod(ctx, accountId)
	if err != nil {
		return a, fmt.Errorf("get active period for account %d: %w", accountId, err)
	}

	a.Period = &p
	return a, nil
}

func (as *AccountService) Add(ctx context.Context, name string, periodStartDay uint8, canDelete bool) (domain.Account, error) {
	// TODO: check unique name?

	a := domain.Account{
		Name:           name,
		PeriodStartDay: periodStartDay,
		CanDelete:      canDelete,
	}

	account, err := as.accountRepo.Add(ctx, a)
	if err != nil {
		return account, fmt.Errorf("add account: %w", err)
	}

	p, err := as.StartPeriod(ctx, account.Id, account.PeriodStartDay, nil)
	if err != nil {
		return account, fmt.Errorf("start period for account %d: %w", account.Id, err)
	}

	account.Period = p
	return account, err
}

func (as *AccountService) Update(ctx context.Context, accountId int64, input types.AccountUpdateInput) (domain.Account, error) {
	a, err := as.accountRepo.Single(ctx, accountId)
	if err != nil {
		return a, fmt.Errorf("update account %d: %w", accountId, err)
	}

	a.Name = input.Name
	a.PeriodStartDay = input.PeriodStartDay

	return as.accountRepo.Update(ctx, a)
}

func (as *AccountService) Delete(ctx context.Context, accountId int64) error {
	a, err := as.accountRepo.Single(ctx, accountId)
	if err != nil {
		return fmt.Errorf("update account %d: %w", accountId, err)
	}

	if !a.CanDelete {
		return fmt.Errorf("can't delete account %d", accountId)
	}

	return as.accountRepo.Delete(ctx, a)
}

func (as *AccountService) StartPeriod(ctx context.Context, accountId int64, startDay uint8, currentPeriod *domain.Period) (*domain.Period, error) {
	var openTime time.Time
	var reportStart time.Time
	var reportEnd time.Time
	var endingBalance int64

	if currentPeriod == nil {
		t := time.Now().UTC()
		openTime = time.Date(t.Year(), t.Month(), int(startDay), 12, 0, 0, 0, time.UTC)
		reportStart = openTime
		endingBalance = 0
	} else {
		t := currentPeriod.ReportingStart
		openTime = time.Now().UTC()
		reportStart = time.Date(t.Year(), t.Month()+1, int(startDay), 12, 0, 0, 0, time.UTC)

		account, err := as.accountRepo.Single(ctx, accountId)
		if err != nil {
			return currentPeriod, fmt.Errorf("get account pre close out %d: %w", accountId, err)
		}

		endingBalance = account.Period.Balance
	}

	reportEnd = reportStart.AddDate(0, 1, -1)

	if currentPeriod != nil {
		// todo: need to make a way to do this in a db transaction
		err := as.periodRepo.ClosePeriod(ctx, accountId)
		if err != nil {
			return currentPeriod, fmt.Errorf("close period for account %d: %w", accountId, err)
		}
	}

	period, err := as.periodRepo.StartPeriod(ctx, accountId, reportStart, reportEnd, openTime)
	if err != nil {
		return &period, fmt.Errorf("start period for account %d: %w", accountId, err)
	}

	_, err = as.transactionRepo.Add(ctx, domain.Transaction{
		AccountId: accountId,
		PeriodId:  period.Id,
		Name:      "Opening Balance",
		Amount:    endingBalance,
		Date:      time.Now().UTC(),
		CanDelete: false,
	})
	if err != nil {
		return &period, fmt.Errorf("opening transaction: %w", err)
	}

	return &period, nil
}

func (as *AccountService) GetActivePeriod(ctx context.Context, accountId int64) (domain.Period, error) {
	return as.periodRepo.GetPeriod(ctx, accountId, repo.ActivePeriodId)
}
