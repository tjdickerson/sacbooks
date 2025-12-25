package server

import (
	"tjdickerson/sacbooks/internal/domain"
	"tjdickerson/sacbooks/pkg/types"
)

func mapTransactionListResult(in types.Result[[]types.Transaction]) types.TransactionListResult {
	return types.TransactionListResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func mapTransactionResult(in types.Result[types.Transaction]) types.TransactionResult {
	return types.TransactionResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func mapRecurringListResult(in types.Result[[]types.Recurring]) types.RecurringListResult {
	return types.RecurringListResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func mapRecurringResult(in types.Result[types.Recurring]) types.RecurringResult {
	return types.RecurringResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func mapAccountListResult(in types.Result[[]types.Account]) types.AccountListResult {
	return types.AccountListResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func mapAccountResult(in types.Result[types.Account]) types.AccountResult {
	return types.AccountResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func mapAccount(account domain.Account) types.Account {
	return types.Account{
		Id:      account.Id,
		Name:    account.Name,
		Balance: account.Balance,
	}
}

func mapAccounts(accounts []domain.Account) []types.Account {
	out := make([]types.Account, 0, len(accounts))
	for _, account := range accounts {
		out = append(out, mapAccount(account))
	}

	return out
}

func mapTransaction(transaction domain.Transaction) types.Transaction {
	return types.Transaction{
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
	return types.Recurring{
		Id:     recurring.Id,
		Name:   recurring.Name,
		Amount: recurring.Amount,
		Day:    recurring.Day,
	}
}

func mapRecurrings(recurrings []domain.Recurring) []types.Recurring {
	out := make([]types.Recurring, 0, len(recurrings))
	for _, recurring := range recurrings {
		out = append(out, mapRecurring(recurring))
	}

	return out
}
