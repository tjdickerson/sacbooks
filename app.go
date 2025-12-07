package main

import (
	"context"
	"fmt"
	"tjdickerson/sacbooks/pkg/server"
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

func (a *App) GetTransactions() string {
	jsonData, err := s.GetTransactionInfo()
	if err != nil {
		return fmt.Sprintf("Error: %s", err.Error())
	}
	return string(jsonData)
}

func (a *App) GetAccount() string {
	jsonData, err := s.GetAccountInfo()
	if err != nil {
		return fmt.Sprintf("Error: %s", err.Error())
	}
	return string(jsonData)
}

func (a *App) GetRecurringList() string {
	jsonData, err := s.GetRecurringList()
	if err != nil {
		return fmt.Sprintf("Error: %s", err.Error())
	}
	return string(jsonData)
}
