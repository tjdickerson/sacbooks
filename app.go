package main

import (
	"context"
	"tjdickerson/sacbooks/pkg/types"
	"tjdickerson/sacbooks/server"
)

// App struct
type App struct {
	ctx context.Context
	s   server.Server
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.s = server.Server{}
	a.s.Startup()
}

func (a *App) shutdown(ctx context.Context) {
	a.s.Shutdown()
}

func (a *App) GetTransactions(accountId int64, periodId int64, limit int, offset int) types.TransactionListResult {
	result := a.s.ListTransactions(accountId, periodId, limit, offset)
	return types.MapTransactionListResult(result)
}

func (a *App) GetAccounts() types.AccountListResult {
	result := a.s.ListAccounts()
	return types.MapAccountListResult(result)
}

func (a *App) GetAccount(accountId int64) types.AccountResult {
	result := a.s.GetAccountInfo(accountId)
	return types.MapAccountResult(result)
}

func (a *App) GetDefaultAccount() types.AccountResult {
	accountId := int64(1)
	result := a.s.GetAccountInfo(accountId)
	return types.MapAccountResult(result)
}

func (a *App) GetRecurringList(accountId int64, periodId int64) types.RecurringListResult {
	result := a.s.GetRecurringList(accountId, periodId)
	return types.MapRecurringListResult(result)
}

func (a *App) AddTransaction(input types.TransactionInsertInput) types.TransactionResult {
	result := a.s.AddTransaction(input)
	return types.MapTransactionResult(result)
}

func (a *App) DeleteTransaction(id int64) types.SimpleResult {
	return a.s.DeleteTransaction(id)
}

func (a *App) UpdateTransaction(input types.TransactionUpdateInput) types.TransactionResult {
	result := a.s.UpdateTransaction(input)
	return types.MapTransactionResult(result)
}

func (a *App) ApplyRecurring(recurringId int64, periodId int64) types.TransactionResult {
	result := a.s.ApplyRecurring(recurringId, periodId)
	return types.MapTransactionResult(result)
}

func (a *App) AddAccount(name string, periodStartDay uint8) types.AccountResult {
	result := a.s.AddAccount(name, periodStartDay)
	return types.MapAccountResult(result)
}

func (a *App) AddRecurring(accountId int64, name string, amount int64, day uint8) types.RecurringResult {
	result := a.s.AddRecurring(accountId, name, amount, day)
	return types.MapRecurringResult(result)
}

func (a *App) DeleteRecurring(id int64) types.SimpleResult {
	return a.s.DeleteRecurring(id)
}

func (a *App) UpdateRecurring(input types.RecurringInput) types.RecurringResult {
	result := a.s.UpdateRecurring(input)
	return types.MapRecurringResult(result)
}

func (a *App) GetActivePeriod(accountId int64) types.PeriodResult {
	result := a.s.GetActivePeriod(accountId)
	return types.MapPeriodResult(result)
}

func (a *App) UpdateAccount(accountId int64, input types.AccountUpdateInput) types.AccountResult {
	return types.MapAccountResult(a.s.UpdateAccount(accountId, input))
}

func (a *App) DeleteAccount(accountId int64) types.SimpleResult {
	return a.s.DeleteAccount(accountId)
}
