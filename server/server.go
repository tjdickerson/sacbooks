package server

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"tjdickerson/sacbooks/internal/database"
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/internal/repo"
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
	dbPath := "C:\\data\\active.db"
	db, err := database.Startup(dbPath)

	if err != nil {
		panic(fmt.Sprintf("Failed to open DB connection: %s", err))
	}

	transactionRepo := repo.NewTransactionRepo(db)
	recurringRepo := repo.NewRecurringsRepo(db)
	accountRepo := repo.NewAccountRepo(db)

	s.db = db
	s.transactionService = service.NewTransactionService(transactionRepo, recurringRepo, accountRepo)
	s.accountService = service.NewAccountService(accountRepo)
	s.recurringService = service.NewRecurringService(recurringRepo)
}

func (s *Server) Shutdown() {
	database.Shutdown(s.db)
}


func (s *Server) GetTransactionList(accountId int64, limit int, offset int) types.Result[[]types.Transaction] {
	ctx := context.Background()

	transactions, err := s.transactionService.List(ctx, accountId, limit, offset)
	if err != nil {
		return types.Fail[[]types.Transaction](fmt.Sprintf("failed to get transactions: %s", err))
	}

	return types.Ok(mapTransactions(transactions))
}

func (s *Server) GetAccountInfo(accountId int64) types.Result[types.Account] {
	ctx := context.Background()

	account, err := s.accountService.Single(ctx, accountId)
	if err != nil {
		return types.Fail[types.Account](fmt.Sprintf("failed to get account: %s", err))
	}
	return types.Ok(mapAccount(account))
}

func (s *Server) GetRecurringList(accountId int64) types.Result[[]types.Recurring] {
	ctx := context.Background()

	recurrings, err := s.recurringService.List(ctx, accountId)	
	if err != nil {
		return types.Fail[[]types.Recurring](fmt.Sprintf("failed to get recurring transactions: %s", err))
	}

	return types.Ok(mapRecurrings(recurrings))
}

func (s *Server) AddTransaction(accountId int64, name string, amount int64, date time.Time) types.Result[types.Transaction] {
	ctx := context.Background()

	transaction, err := s.transactionService.Add(ctx, accountId, name, amount, date)

	if err != nil {
		return types.Fail[types.Transaction](fmt.Sprintf("error adding transaction: %s", err))
	}

	return types.Ok(mapTransaction(transaction))
}

func (s *Server) DeleteTransaction(id int64) types.SimpleResult {
	ctx := context.Background()

	err := s.transactionService.Delete(ctx, id)
	if err != nil {
		return types.SimpleResult { Success: false, Message: fmt.Sprintf("error deleting transaction: %s", err) }
	}

	return types.SimpleResult { Success: true, Message: "Deleted" }
}

func (s *Server) UpdateTransaction(input types.TransactionInput) types.Result[types.Transaction] {
	ctx := context.Background()

	t, err := s.transactionService.Update(ctx, input)
	if err != nil {
		return types.Fail[types.Transaction](fmt.Sprintf("updating transaction %s: %w", input.Id, err))
	}

	return types.Ok(mapTransaction(t))
}

func (s *Server) ApplyRecurring(recurringId int64) types.Result[types.Transaction] {
	ctx := context.Background()

	t, err := s.transactionService.ApplyRecurring(ctx, recurringId)
	if err != nil {
		return types.Fail[types.Transaction](fmt.Sprintf("applying recurring transaction: %s", err))
	}

	return types.Ok(mapTransaction(t))
}

func mapAccount(account domain.Account) types.Account {
	return types.Account {
		Id: account.Id,
		Name: account.Name,
		Balance: account.Balance,
	}
}

func mapTransaction(transaction domain.Transaction) types.Transaction {
	return types.Transaction {
			Id:          transaction.Id,
			Date:        transaction.Date,
			DisplayDate: transaction.Date.Format("02 Jan 2006"),
			Amount:      transaction.Amount,
			Name:        transaction.Name,
	}
}

func mapTransactions(transactions []domain.Transaction) []types.Transaction {
	out := make([]types.Transaction, 0, len(transactions))
	for _, transaction := range transactions {
		out = append(out, mapTransaction(transaction))
	}

	return out
}

func mapRecurring(recurring domain.Recurring) types.Recurring {
	return types.Recurring {
		Id: recurring.Id,
		Name: recurring.Name,
		Amount: recurring.Amount,
		Day: recurring.Day,
	}
}

func mapRecurrings(recurrings []domain.Recurring) []types.Recurring {
	out := make([]types.Recurring, 0, len(recurrings))
	for _, recurring := range recurrings {
		out = append(out, mapRecurring(recurring))
	}

	return out
}
