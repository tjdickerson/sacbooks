import React from "react";
import {types as t} from "../../wailsjs/go/models";
import {getCategoryColor} from "../lib/category";

interface CategorySelectorProps {
    label: string;
    selectedId: number;
    dataSource: Map<number, t.Category>;
    onChange: (categoryId: number) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
                                                               label,
                                                               selectedId,
                                                               dataSource,
                                                               onChange,
                                                           }: CategorySelectorProps): React.JSX.Element => {

    return (
        <div className='text-input-container' aria-label={label}>
            <div className='text-input-label'>{label}</div>
            <select
                value={selectedId}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    borderLeft: `6px solid ${getCategoryColor(selectedId)}`,
                    paddingLeft: '8px'
                }}
            >
                <option value={0}>None</option>
                {Array.from(dataSource.values()).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default CategorySelector;
