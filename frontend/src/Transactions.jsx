import { useState, useEffect } from 'react';
import { TestData } from "../wailsjs/go/main/App";
import Transaction from './Transaction';
import './App.css';

function Transactions() {
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
        <div className='transaction-view'>
            <div className='transaction-view-area'>
                <div className='transaction-new'>
                    <div className='transaction-new-label'>New Transaction</div>
                    <input type="text" className='transaction-new-input' placeholder='Transaction Name' />
                    <input type="number" className='transaction-new-input' placeholder='Amount' />
                    <button className='transaction-new-button'>Add</button>
                </div>
                <div className='transaction-container'>
                    {loading && <p>Loading..</p>}
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                    {!loading && !error && (
                        data.length === 0
                            ? <p>No Data</p>
                            : (
                                <div>
                                    {data.map((transaction) => (
                                        <Transaction key={transaction.Id} transaction={transaction} />
                                    ))}
                                </div>
                            )
                    )}
                </div>
            </div>
            <div className='transaction-view-area'>
                RECURRINGS HERE
            </div>
        </div>
    )
}

export default Transactions;