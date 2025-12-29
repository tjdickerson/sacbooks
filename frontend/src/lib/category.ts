import { types as t } from "../../wailsjs/go/models";
import {ListCategories} from "../../wailsjs/go/main/App";

const categoryCache: Map<number, t.Category> = new Map();

export async function refreshCategoryCache(accountId: number): Promise<boolean> {
    const result: t.CategoryListResult = await ListCategories(accountId)
    if (result.success) {
        categoryCache.clear();
        const list: t.Category[] = result.data;
        list.map((cat) => {
            categoryCache.set(cat.id, cat);
        });

        return true;
    } else {
        // error
        return false
    }
}

export function getCategoryCache(): Map<number, t.Category> {
    return categoryCache;
}

export function getCategoryColor(categoryId: number): string {
    return categoryCache.get(categoryId)?.color ?? '#cacaca';
}

export function getCategoryById(categoryId: number): t.Category | undefined {
    return categoryCache.get(categoryId);
}



