package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/database"
	"tjdickerson/sacbooks/internal/repo"
	"tjdickerson/sacbooks/internal/schema"
	"tjdickerson/sacbooks/internal/service"
	"tjdickerson/sacbooks/pkg/types"
)

type Server struct {
	db                 *sql.DB
	transactionService *service.TransactionService
	accountService     *service.AccountService
	recurringService   *service.RecurringService
}

func (s *Server) Startup() {
	ctx := context.Background()
	dbPath := ".\\active.db"

	db, err := database.Startup(dbPath)

	if err != nil {
		panic(fmt.Sprintf("Failed to open DB connection: %s", err))
	}

	transactionRepo := repo.NewTransactionRepo(db)
	recurringRepo := repo.NewRecurringsRepo(db)
	accountRepo := repo.NewAccountRepo(db)
	periodRepo := repo.NewPeriodRepo(db)

	s.db = db
	s.transactionService = service.NewTransactionService(transactionRepo, recurringRepo, accountRepo)
	s.accountService = service.NewAccountService(accountRepo, periodRepo)
	s.recurringService = service.NewRecurringService(recurringRepo)

	err = schema.Ensure(ctx, db)
	if errors.Is(err, schema.NoAccountError) {
		account, err := s.accountService.Add(ctx, "Checking", 7)
		if err != nil {
			panic(fmt.Sprintf("Failed to create default account: %s", err))
		}

		err = s.accountService.StartPeriod(ctx, account.Id, account.PeriodStartDay, nil);
		if err != nil {
			panic(fmt.Sprintf("Failed to create default period: %s", err))
		}
	} else if (err != nil) {
		panic(fmt.Sprintf("Failed to initialize new database: %s", err))
	}
}

func (s *Server) Shutdown() {
	database.Shutdown(s.db)
}

func (s *Server) ListTransactions(accountId int64, limit int, offset int) types.Result[[]types.Transaction] {
	ctx := context.Background()

	transactions, err := s.transactionService.List(ctx, accountId, limit, offset)
	if err != nil {
		return types.Fail[[]types.Transaction](fmt.Sprintf("failed to get transactions: %s", err))
	}

	return types.Ok(types.MapTransactions(transactions))
}

func (s *Server) GetAccountInfo(accountId int64) types.Result[types.Account] {
	ctx := context.Background()

	account, err := s.accountService.Single(ctx, accountId)
	if err != nil {
		return types.Fail[types.Account](fmt.Sprintf("failed to get account: %s", err))
	}
	return types.Ok(types.MapAccount(account))
}

func (s *Server) GetRecurringList(accountId int64) types.Result[[]types.Recurring] {
	ctx := context.Background()

	recurrings, err := s.recurringService.List(ctx, accountId)
	if err != nil {
		return types.Fail[[]types.Recurring](fmt.Sprintf("failed to get recurring transactions: %s", err))
	}

	return types.Ok(types.MapRecurrings(recurrings))
}

func (s *Server) AddRecurring(accountId int64, name string, amount int64, day uint8) types.Result[types.Recurring] {
	ctx := context.Background()

	recurring, err := s.recurringService.Add(ctx, accountId, name, amount, day)
	if err != nil {
		return types.Fail[types.Recurring](fmt.Sprintf("adding recurring: %s", err))
	}

	return types.Ok(types.MapRecurring(recurring))
}

func (s *Server) AddTransaction(accountId int64, name string, amount int64, date time.Time) types.Result[types.Transaction] {
	ctx := context.Background()

	transaction, err := s.transactionService.Add(ctx, accountId, name, amount, date)

	if err != nil {
		return types.Fail[types.Transaction](fmt.Sprintf("error adding transaction: %s", err))
	}

	return types.Ok(types.MapTransaction(transaction))
}

func (s *Server) DeleteTransaction(id int64) types.SimpleResult {
	ctx := context.Background()

	err := s.transactionService.Delete(ctx, id)
	if err != nil {
		return types.SimpleResult{Success: false, Message: fmt.Sprintf("error deleting transaction: %s", err)}
	}

	return types.SimpleResult{Success: true, Message: "Deleted"}
}

func (s *Server) UpdateTransaction(input types.TransactionInput) types.Result[types.Transaction] {
	ctx := context.Background()

	t, err := s.transactionService.Update(ctx, input)
	if err != nil {
		return types.Fail[types.Transaction](fmt.Sprintf("updating transaction: %s", err))
	}

	return types.Ok(types.MapTransaction(t))
}

func (s *Server) ApplyRecurring(recurringId int64) types.Result[types.Transaction] {
	ctx := context.Background()

	t, err := s.transactionService.ApplyRecurring(ctx, recurringId)
	if err != nil {
		return types.Fail[types.Transaction](fmt.Sprintf("applying recurring transaction: %s", err))
	}

	return types.Ok(types.MapTransaction(t))
}

func (s *Server) AddAccount(name string, periodStartDay uint8) types.Result[types.Account] {
	ctx := context.Background()

	a, err := s.accountService.Add(ctx, name, periodStartDay)

	if err != nil {
		return types.Fail[types.Account](fmt.Sprintf("adding account: %s", err))
	}

	return types.Ok(types.MapAccount(a))
}

func (s *Server) ListAccounts() types.Result[[]types.Account] {
	ctx := context.Background()

	list, err := s.accountService.List(ctx)
	if err != nil {
		return types.Fail[[]types.Account](fmt.Sprintf("error listing accounts: %s", err))
	}

	return types.Ok(types.MapAccounts(list))

}

func (s *Server) UpdateRecurring(input types.RecurringInput) types.Result[types.Recurring] {
	ctx := context.Background()

	result, err := s.recurringService.Update(ctx, input)
	if err != nil {
		return types.Fail[types.Recurring](fmt.Sprintf("error updating recurring: %s", err))
	}

	return types.Ok(types.MapRecurring(result))
}

func (s *Server) DeleteRecurring(id int64) types.SimpleResult {
	ctx := context.Background()

	err := s.recurringService.Delete(ctx, id)
	if err != nil {
		return types.SimpleResult{Success: false, Message: fmt.Sprintf("error deleting recurring: %s", err)}
	}

	return types.SimpleResult{Success: true, Message: "Deleted"}
}

func (s *Server) GetActivePeriod(accountId int64) types.Result[types.Period] {
	ctx := context.Background()

	result, err := s.accountService.GetActivePeriod(ctx, accountId)
	if err != nil {
		return types.Fail[types.Period](fmt.Sprintf("error getting active period: %s", err))
	}	

	return types.Ok(types.MapPeriod(result))
}

