package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
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
}

type Transaction struct {
	Id          int
	Date        time.Time
	DisplayDate string
	Amount      float64
	Name        string
}

// Greet returns a greeting for the given name
func (a *App) TestData(name string) string {
	test := []Transaction{
		{Id: 1, Date: time.Now(), DisplayDate: time.Now().Format("02 Jan"), Amount: 100.50, Name: "Alice"},
		{Id: 2, Date: time.Now(), DisplayDate: time.Now().Format("02 Jan"), Amount: 200.75, Name: "Bob"},
		{Id: 3, Date: time.Now(), DisplayDate: time.Now().Format("02 Jan"), Amount: 300.00, Name: "Charlie"},
	}

	jsonData, err := json.Marshal(test)
	if err != nil {
		return fmt.Sprintf("Error: %s", err.Error())
	}

	return string(jsonData)
}
