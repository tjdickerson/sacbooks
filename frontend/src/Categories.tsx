import {AccountContextValue, useAccountSelection} from "./AccountContext";
import {types as t} from "../wailsjs/go/models";
import {useEffect, useState} from "react";
import {AddCategory, ListCategories} from "../wailsjs/go/main/App";
import CategoryCard from "./CategoryCard";
import NewCategoryForm from "./NewCategoryForm";
import {refreshCategoryCache} from "./lib/category";

function Categories() {
    const [error, setError] = useState<string>('');
    const [list, setList] = useState<t.Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [addingCategory, setAddingCategory] = useState<boolean>(false);

    const accountContext: AccountContextValue = useAccountSelection();
    const selectedAccount: t.Account | null = accountContext.selectedAccount;
    const selectedAccountId: number = selectedAccount?.id || 0;

    async function loadCategories() {
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const result: t.CategoryListResult = await ListCategories(selectedAccountId);
            if (result.success) {
                setList(result.data)
            } else {
                setError(result.message);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function init() {
            await loadCategories();
        }

        void init();
    }, [selectedAccountId]);

    async function handleAddCategory(name: string, color: string) {
        setError('');
        setLoading(true);

        try {
            const input: t.CategoryInsertInput = {
                name: name,
                color: color,
            };
            const result: t.CategoryResult = await AddCategory(selectedAccountId, input);
            if (result.success) {
                await loadCategories();
                await refreshCategoryCache(selectedAccountId);
            } else {
                setError(result.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='view-layout'>
            {loading && <p>Loading..</p>}

            {addingCategory ? (
                <div className='form-area'>
                    <NewCategoryForm
                        onSubmit={handleAddCategory}
                        onCancel={() => setAddingCategory(false)}
                        submitting={loading}
                        initialValues={{name: "", color: "#51b36f"}}/>
                </div>
            ) : (
                <div className='view-bar'>
                    <div className='view-name'>Categories</div>
                    <div className='view-buttons'>
                        <button
                            type='button'
                            className='btn-primary account-new-button'
                            onClick={() => setAddingCategory(true)}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <div className='list-container'>
                {error && <p style={{color: 'red'}}>Error: {error}</p>}
                <div className='scrollbox container'>
                    <div className='card-list'>
                        {list.length == 0 && (<div>No Categories...</div>)}
                        {list.length > 0 && list.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Categories;