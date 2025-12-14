package server

import (
	"fmt"
	"log"
	"time"
	db "tjdickerson/sacbooks/pkg/database"
	"tjdickerson/sacbooks/pkg/types"
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

func (s *Server) GetTransactionList(limit int, offset int) types.Result[[]types.Transaction] {
	result := types.Result[[]types.Transaction]{
		Success: true,
	}

	tData, err := db.FetchTransactions(limit, offset)
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("failed to get transaction data: %s", err)
		return result
	}

	var transactions []types.Transaction
	transactions = make([]types.Transaction, 0, 20)
	for _, t := range tData {
		transactions = append(transactions, types.Transaction{
			Id:          t.Id,
			Date:        t.Date,
			DisplayDate: t.Date.Format("02 Jan 2006"),
			Amount:      t.Amount,
			Name:        t.Name,
		})
	}

	result.Object = transactions
	return result
}

func (s *Server) GetAccountInfo() types.Result[types.Account] {
	result := types.Result[types.Account]{
		Success: true,
	}
	account, err := db.GetDefaultAccount()
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("failed to get current balance: %s", err)
		return result
	}

	data := types.Account{
		Id:      account.Id,
		Name:    account.Name,
		Balance: account.TotalAvailable,
	}

	result.Object = data
	return result
}

func (s *Server) GetRecurringList() types.Result[[]types.Recurring] {
	result := types.Result[[]types.Recurring]{Success: true}
	recurringData, err := db.FetchAllRecurrings()
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("failed to get recurring list: %s", err)
		return result
	}

	var recurringList []types.Recurring
	recurringList = make([]types.Recurring, 0, len(recurringData))
	for _, r := range recurringData {
		recurringList = append(recurringList, types.Recurring{
			Id:     r.Id,
			Name:   r.Name,
			Amount: r.Amount,
			Day:    r.Day,
		})
	}

	result.Object = recurringList
	return result
}

func (s *Server) AddTransaction(name string, amount int64, date time.Time) types.Result[types.Transaction] {
	result := types.Result[types.Transaction]{
		Success: true,
		Message: "",
	}

	t := &db.Transaction{
		Name:   name,
		Amount: amount,
		Date:   date,
	}

	err := db.Insert(t)
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("failed to add transaction: %s", err)
		return result
	}

	transaction := types.Transaction{
		Id:          t.Id,
		Date:        t.Date,
		DisplayDate: t.Date.Format("02 Jan 2006"),
		Amount:      t.Amount,
		Name:        t.Name,
	}

	result.Object = transaction
	return result
}

func (s *Server) DeleteTransaction(id int64) types.Result[types.Transaction] {
	result := types.Result[types.Transaction]{
		Success: true,
		Message: "",
	}

	temp := db.Transaction{Id: id}
	if err := db.Delete(&temp); err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("failed to delete transaction: %s", err)
	}

	return result
}

func (s *Server) UpdateTransaction(id int64, newName string, newAmount int64) types.Result[types.Transaction] {
	result := types.Result[types.Transaction]{
		Success: true,
		Message: "",
	}

	temp, err := db.GetTransactionById(id)
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("error during update: %s", err)
		return result
	}

	temp.Name = newName
	temp.Amount = newAmount

	err = db.Update(&temp)
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("error during update: %s", err)
		return result
	}

	feo := types.Transaction{
		Id:     temp.Id,
		Name:   temp.Name,
		Amount: temp.Amount,
	}
	result.Object = feo

	return result
}

func (s *Server) ApplyRecurring(recurringId int64) types.Result[types.Transaction] {
	result := types.Result[types.Transaction]{
		Success: true,
		Message: "",
	}

	transaction, err := db.CreateTransactionFromRecurring(recurringId)
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("error creating transaction: %s", err)
		return result
	}

	feo := types.Transaction{
		Id:     transaction.Id,
		Name:   transaction.Name,
		Date:   transaction.Date,
		Amount: transaction.Amount,
	}
	result.Object = feo

	return result
}
