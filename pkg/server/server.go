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
