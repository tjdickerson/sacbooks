package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
	db "tjdickerson/sacbooks/pkg/database"
)

type serverContext struct {
	currentAccount *db.Account
	currentMonth   string
	currentYear    string
}

var (
	servctx *serverContext
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	servctx = &serverContext{}

	dbPath := "C:\\data\\active.db"
	db.InitDatabase(dbPath, false)

	account, err := db.GetDefaultAccount()
	if err != nil {
		log.Fatalf("error getting default account: %s", err)
	}
	servctx.currentAccount = &account
}

type TransactionDisplay struct {
	Id          int
	Date        time.Time
	DisplayDate string
	Amount      float64
	Name        string
}

// Greet returns a greeting for the given name
func (a *App) TestData(name string) string {
	testData, err := db.FetchAllTransactions()
	log.Printf("Fetched test data: %d\n", len(testData))
	if err != nil {
		return fmt.Sprintf("Error: %s", err.Error())
	}
	var testDisplay []TransactionDisplay
	testDisplay = make([]TransactionDisplay, 0, 20)
	for _, t := range testData {
		testDisplay = append(testDisplay, TransactionDisplay{
			Id:          t.Id,
			Date:        t.Date,
			DisplayDate: t.Date.Format("02 Jan"),
			Amount:      float64(t.Amount) / 100.0,
			Name:        t.Name,
		})
	}

	jsonData, err := json.Marshal(testDisplay)
	if err != nil {
		return fmt.Sprintf("Error: %s", err.Error())
	}

	return string(jsonData)
}
