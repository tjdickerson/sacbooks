import './App.css';
import { useState, useEffect } from 'react';
import { TestData } from "../wailsjs/go/main/App";
import Menu from "./Menu";
import Transaction from './Transaction';
import { use } from 'react';


function App() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        TestData()
            .then((result) => {
                if (!mounted) return;
                let parsed = result;

                if (typeof result === 'string') {
                    try { parsed = JSON.parse(result); }
                    catch (e) { }
                }

                setData(Array.isArray(parsed) ? parsed : []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err?.message || 'Error fetching data');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });
        return () => { mounted = false; }
    }, []);

    return (
        <div id="App">
            <header className="app-header">
                <Menu />
            </header>
            <main id="app-content" className="app-main">
                <div className="container">
                    {loading && <p>Loading..</p>}
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                    {!loading && !error && (
                        data.length === 0
                            ? <p>No Data</p>
                            : (
                            <div className='transaction-container'>
                                    {data.map((transaction) => (
                                        <Transaction key={transaction.Id} transaction={transaction} />
                                    ))} 
                            </div>
                            )
                    )}
                </div>
            </main>
        </div>
    )
}

export default App
