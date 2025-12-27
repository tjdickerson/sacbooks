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
	return as.accountRepo.List(ctx)
}

func (as *AccountService) Single(ctx context.Context, accountId int64) (domain.Account, error) {
	return as.accountRepo.Single(ctx, accountId)
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

	err = as.StartPeriod(ctx, account.Id, account.PeriodStartDay, nil)

	return account, err
}

func (as *AccountService) Update(ctx context.Context, accountId int64, input types.AccountUpdateInput) error {
	a := domain.Account{
		Id: accountId, Name: input.Name, PeriodStartDay: input.PeriodStartDay,
	}
	return as.accountRepo.Update(ctx, a)
}

func (as *AccountService) Delete(ctx context.Context, accountId int64) error {
	a := domain.Account{Id: accountId}
	return as.accountRepo.Delete(ctx, a)
}

func (as *AccountService) StartPeriod(ctx context.Context, accountId int64, startDay uint8, currentPeriod *domain.Period) error {
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
			return fmt.Errorf("get account pre close out %d: %w", accountId, err)
		}

		endingBalance = account.Balance
	}

	reportEnd = reportStart.AddDate(0, 1, -1)

	// todo: need to make a way to do this in a transaction
	err := as.periodRepo.ClosePeriod(ctx, accountId)
	if err != nil {
		return fmt.Errorf("close period for account %d: %w", accountId, err)
	}

	err = as.periodRepo.StartPeriod(ctx, accountId, reportStart, reportEnd, openTime)
	if err != nil {
		return fmt.Errorf("start period for account %d: %w", accountId, err)
	}

	account, err := as.accountRepo.Single(ctx, accountId)
	if err != nil {
		return fmt.Errorf("get account %d: %w", accountId, err)
	}

	_, err = as.transactionRepo.Add(ctx, domain.Transaction{
		AccountId: accountId,
		PeriodId:  account.PeriodId,
		Name:      "Opening Balance",
		Amount:    endingBalance,
		Date:      time.Now().UTC(),
		CanDelete: false,
	})
	if err != nil {
		return fmt.Errorf("opening transaction: %w", err)
	}

	return nil
}

func (as *AccountService) GetActivePeriod(ctx context.Context, accountId int64) (domain.Period, error) {
	return as.periodRepo.GetActivePeriod(ctx, accountId)
}
