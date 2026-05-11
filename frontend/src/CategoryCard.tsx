import React, {useState} from "react";
import {types as t} from "../wailsjs/go/models";
import {FaEdit, FaSave, FaTimes, FaTrash} from "react-icons/fa";
import TextInput from "./input/TextInput";
import ColorInput from "./input/ColorInput";

interface CategoryCardProps {
    category: t.Category;
    onSave: (id: number, name: string, color: string) => void;
    onDelete: (id: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
                                                       category,
                                                       onSave,
                                                       onDelete
                                                   }: CategoryCardProps): React.JSX.Element => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(category.name);
    const [editColor, setEditColor] = useState(category.color);

    const handleSave = () => {
        onSave(category.id, editName, editColor);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setEditName(category.name);
        setEditColor(category.color);
        setIsEditing(false);
    }

    return (
        <div className='card' key={category.id}>
            <div className='card-color-stripe' style={{backgroundColor: category.color}}/>
            <div className={`card-details ${isEditing ? 'inline-form-content' : ''}`}>
                <div className='form-fields'>
                    {isEditing ? (
                        <>
                            <TextInput
                                label="Category Name"
                                value={editName}
                                onChange={setEditName}
                                placeholder='Name'
                            />
                            <ColorInput
                                label="Category Color"
                                value={editColor}
                                onChange={setEditColor}
                            />
                        </>
                    ) : (
                        <>
                            <div className='card-name label'>{category.name}</div>
                            <div className='text-muted' style={{fontSize: '12px'}}>{category.color}</div>
                        </>
                    )}
                </div>
                <div className='action-buttons'>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave}>
                                <FaSave/>
                            </button>
                            <button onClick={handleCancel}>
                                <FaTimes/>
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)}>
                                <FaEdit/>
                            </button>
                            <button className='danger' onClick={() => onDelete(category.id)}>
                                <FaTrash/>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CategoryCard;