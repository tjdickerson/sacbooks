package main

import (
	"context"
	"time"
	"tjdickerson/sacbooks/pkg/types"
	"tjdickerson/sacbooks/server"
)

// App struct
type App struct {
	ctx context.Context
	s server.Server
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

func (a *App) GetTransactions(limit int, offset int) types.TransactionListResult {
	accountId := int64(1)
	result := a.s.GetTransactionList(accountId, limit, offset)
	return types.TransactionListResult{
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
}

func (a *App) GetAccount() types.AccountResult {
	accountId := int64(1)
	result := a.s.GetAccountInfo(accountId)
	return types.AccountResult{
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
}

func (a *App) GetRecurringList() types.RecurringListResult {
	accountId := int64(1)
	result := a.s.GetRecurringList(accountId)
	return types.RecurringListResult {
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
}

func (a *App) AddTransaction(name string, amount int64) types.TransactionResult {
	accountId := int64(1)
	result := a.s.AddTransaction(accountId, name, amount, time.Now())
	resultOut := types.TransactionResult {
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
	return resultOut
}

func (a *App) DeleteTransaction(id int64) types.TransactionResult {
	result := a.s.DeleteTransaction(id)
	return types.TransactionResult{
		Success: result.Success,
		Message: result.Message,
	}
}

func (a *App) UpdateTransaction(id int64, newName string, newAmount int64) types.TransactionResult {
	result := a.s.UpdateTransaction(id, newName, newAmount)
	return types.TransactionResult {
		Success: result.Success,
		Message: result.Message,
		Data: result.Object,
	}
}

func (a *App) ApplyRecurring(id int64) types.TransactionResult {
	result := a.s.ApplyRecurring(id)
	return types.TransactionResult {
		Success: result.Success,
		Message: result.Message,
		Data: result.Object,
	}
}
