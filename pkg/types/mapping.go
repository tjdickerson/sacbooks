package types

import (
	"tjdickerson/sacbooks/internal/domain"
)

func MapTransactionListResult(in Result[[]Transaction]) TransactionListResult {
	return TransactionListResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func MapTransactionResult(in Result[Transaction]) TransactionResult {
	return TransactionResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func MapRecurringListResult(in Result[[]Recurring]) RecurringListResult {
	return RecurringListResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func MapRecurringResult(in Result[Recurring]) RecurringResult {
	return RecurringResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func MapAccountListResult(in Result[[]Account]) AccountListResult {
	return AccountListResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func MapAccountResult(in Result[Account]) AccountResult {
	return AccountResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func MapPeriodResult(in Result[Period]) PeriodResult {
	return PeriodResult{
		Success: in.Success,
		Message: in.Message,
		Data:    in.Object,
	}
}

func MapAccount(account domain.Account) Account {
	return Account{
		Id:             account.Id,
		Name:           account.Name,
		PeriodStartDay: account.PeriodStartDay,
		CanDelete:      account.CanDelete,
		Period:         MapPeriod(*account.Period),
	}
}

func MapAccounts(accounts []domain.Account) []Account {
	out := make([]Account, 0, len(accounts))
	for _, account := range accounts {
		out = append(out, MapAccount(account))
	}

	return out
}

func MapTransaction(transaction domain.Transaction) Transaction {
	return Transaction{
		Id:          transaction.Id,
		Date:        transaction.Date,
		DisplayDate: transaction.Date.Format("Mon Jan 02"),
		Amount:      transaction.Amount,
		Name:        transaction.Name,
	}
}

func MapTransactions(transactions []domain.Transaction) []Transaction {
	out := make([]Transaction, 0, len(transactions))
	for _, transaction := range transactions {
		out = append(out, MapTransaction(transaction))
	}

	return out
}

func MapRecurring(recurring domain.Recurring) Recurring {
	return Recurring{
		Id:                recurring.Id,
		Name:              recurring.Name,
		Amount:            recurring.Amount,
		Day:               recurring.Day,
		AccountedInPeriod: recurring.AccountedInPeriod,
	}
}

func MapRecurrings(recurrings []domain.Recurring) []Recurring {
	out := make([]Recurring, 0, len(recurrings))
	for _, recurring := range recurrings {
		out = append(out, MapRecurring(recurring))
	}

	return out
}

func MapPeriod(period domain.Period) Period {
	return Period{
		Id:             period.Id,
		ReportingStart: period.ReportingStart.Format("Mon Jan 02"),
		ReportingEnd:   period.ReportingEnd.Format("Mon Jan 02"),
		OpenedOn:       period.OpenedOn.Format("Mon Jan 02"),
		Balance:        period.Balance,
	}
}
