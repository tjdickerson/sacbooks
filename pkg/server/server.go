package server

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
	db "tjdickerson/sacbooks/pkg/database"
)

type serverContext struct {
	currentAccount *db.Account
}

type Server struct {
	context *serverContext
}

func (s *Server) Startup() {
	s.context = &serverContext{}

	dbPath := "C:\\data\\active.db"
	db.InitDatabase(dbPath, false)

	account, err := db.GetDefaultAccount()
	if err != nil {
		log.Fatalf("error getting default account: %s", err)
	}
	s.context.currentAccount = &account
}

func (s *Server) Shutdown() {
	db.CloseDatabase()
}

type TransactionDisplay struct {
	Id          int
	Date        time.Time
	DisplayDate string
	Amount      float64
	Name        string
}

type AccountInfo struct {
	Id             int
	Name           string
	CurrentBalance float64
}

type RecurringDisplay struct {
	Id     int
	Name   string
	Amount float64
	Day    uint8
}

func (s *Server) GetTransactionInfo() (string, error) {
	testData, err := db.FetchAllTransactions()
	log.Printf("Fetched test data: %d\n", len(testData))
	if err != nil {
		return "", fmt.Errorf("failed to get transaction data: %s", err.Error())
	}
	var testDisplay []TransactionDisplay
	testDisplay = make([]TransactionDisplay, 0, 20)
	for _, t := range testData {
		testDisplay = append(testDisplay, TransactionDisplay{
			Id:          t.Id,
			Date:        t.Date,
			DisplayDate: t.Date.Format("02 Jan 2006"),
			Amount:      float64(t.Amount),
			Name:        t.Name,
		})
	}

	jsonData, err := json.Marshal(testDisplay)
	if err != nil {
		return "", fmt.Errorf("failed to convert to json: %s", err.Error())
	}

	return string(jsonData), nil
}

func (s *Server) GetAccountInfo() (string, error) {
	account, err := db.GetDefaultAccount()
	if err != nil {
		return "", fmt.Errorf("failed to get current balance: %s", err.Error())
	}

	displayInfo := AccountInfo{
		Id:             account.Id,
		Name:           account.Name,
		CurrentBalance: float64(account.TotalAvailable),
	}

	jsonData, err := json.Marshal(displayInfo)
	if err != nil {
		return "", fmt.Errorf("failed to convert to json: %s", err.Error())
	}

	return string(jsonData), nil
}

func (s *Server) GetRecurringList() (string, error) {
	recurrings, err := db.FetchAllRecurrings()
	if err != nil {
		return "", fmt.Errorf("failed to get recurring list: %s", err.Error())
	}
	var recurringDisplay []RecurringDisplay
	recurringDisplay = make([]RecurringDisplay, 0, len(recurrings))
	for _, r := range recurrings {
		recurringDisplay = append(recurringDisplay, RecurringDisplay{
			Id:     r.Id,
			Name:   r.Name,
			Amount: float64(r.Amount),
			Day:    r.Day,
		})
	}

	jsonData, err := json.Marshal(recurringDisplay)
	if err != nil {
		return "", fmt.Errorf("failed to convert to json: %s", err.Error())
	}

	return string(jsonData), nil
}

func (s *Server) AddTransaction(name string, amount float64, date time.Time) error {
	newTransaction := &db.Transaction{
		Name:   name,
		Amount: int64(amount),
		Date:   date,
	}

	log.Printf("got test data: %s   %f\n", name, amount)

	err := db.Insert(newTransaction)
	if err != nil {
		return fmt.Errorf("failed to add transaction: %s", err.Error())
	}

	return nil
}
