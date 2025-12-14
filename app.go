package main

import (
	"context"
	"time"
	"tjdickerson/sacbooks/pkg/server"
	"tjdickerson/sacbooks/pkg/types"
)

// App struct
type App struct {
	ctx context.Context
}

var s *server.Server

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	s = &server.Server{}
	s.Startup()
}

func (a *App) shutdown(ctx context.Context) {
	s.Shutdown()
}

func (a *App) GetTransactions(limit int, offset int) types.TransactionListResult {
	result := s.GetTransactionList(limit, offset)
	return types.TransactionListResult{
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
}

func (a *App) GetAccount() types.AccountResult {
	result := s.GetAccountInfo()
	return types.AccountResult{
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
}

func (a *App) GetRecurringList() types.RecurringListResult {
	result := s.GetRecurringList()
	return types.RecurringListResult {
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
}

func (a *App) AddTransaction(name string, amount int64) types.TransactionResult {
	result := s.AddTransaction(name, amount, time.Now())
	resultOut := types.TransactionResult {
		Success: result.Success,
		Message: result.Message,
		Data:    result.Object,
	}
	return resultOut
}

func (a *App) DeleteTransaction(id int64) types.TransactionResult {
	result := s.DeleteTransaction(id)
	return types.TransactionResult{
		Success: result.Success,
		Message: result.Message,
	}
}

func (a *App) UpdateTransaction(id int64, newName string, newAmount int64) types.TransactionResult {
	result := s.UpdateTransaction(id, newName, newAmount)
	return types.TransactionResult {
		Success: result.Success,
		Message: result.Message,
		Data: result.Object,
	}
}

func (a *App) ApplyRecurring(id int64) types.TransactionResult {
	result := s.ApplyRecurring(id)
	return types.TransactionResult {
		Success: result.Success,
		Message: result.Message,
		Data: result.Object,
	}
}
