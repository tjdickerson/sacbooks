import React, {useState} from "react";
import {types as t} from "../wailsjs/go/models";

interface CategoryCardProps {
    category: t.Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
                                                   }: CategoryCardProps): React.JSX.Element => {

    return (
        <div className='card'>
            <div className='card-color-stripe' style={{backgroundColor: category.color}}/>
            <div>{category.name}</div>
            <div>{category.color}</div>
        </div>
    )
}

export default CategoryCard;