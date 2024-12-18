import React, { useState } from "react";
import {
    createCategory,
    updateCategory,
    deleteCategory,
} from "../api/categoryApi";

const CategoryManagementModal = ({
                                     isOpen,
                                     onClose,
                                     categories,
                                     setCategories,
                                     setEvents,
                                     refreshTodayTasks,
                                     refreshCategories
                                 }) => {
    const [newCategory, setNewCategory] = useState({ name: "", color: "" });
    const [categoryEditMode, setCategoryEditMode] = useState(false);
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);

    const colors = [
        { name: "빨강", value: "RED", code: "#FF0000", isDefault: false },
        { name: "초록", value: "GREEN", code: "#00FF00", isDefault: false },
        { name: "파랑", value: "BLUE", code: "#0000FF", isDefault: false },
        { name: "노랑", value: "YELLOW", code: "#FFFF00", isDefault: false },
        { name: "하늘색", value: "SKYBLUE", code: "#87CEEB", isDefault: false },
        { name: "회색", value: "GREY", code: "#626262", isDefault: true },
    ];

    const getColorName = (colorValue) => {
        if (!colorValue) return "색상을 선택해주세요";
        const matchedColor = colors.find(
            (color) =>
                color.value.toUpperCase() === colorValue.toUpperCase() ||
                color.code.toUpperCase() === colorValue.toUpperCase()
        );
        return matchedColor ? matchedColor.name : "유효하지 않은 카테고리 색상";
    };

    const handleCategorySubmit = async () => {
        try {
            const colorName = colors.find(
                (color) => color.value.toUpperCase() === newCategory.color.toUpperCase()
            )?.value;

            if (!colorName) {
                alert("유효하지 않은 색상입니다.");
                return;
            }

            if (categoryEditMode) {
                await updateCategory({
                    categoryId: newCategory.id,
                    name: newCategory.name,
                    color: colorName,
                });

                setCategories((prevCategories) =>
                    prevCategories.map((cat) =>
                        cat.categoryId === newCategory.id
                            ? { ...cat, name: newCategory.name, color: newCategory.color }
                            : cat
                    )
                );

                setEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event.categoryId === newCategory.id
                            ? { ...event, backgroundColor: newCategory.color }
                            : event
                    )
                );

                refreshTodayTasks();
                refreshCategories();
                alert("카테고리가 성공적으로 수정되었습니다.");
            } else {
                const newCategoryId = await createCategory({
                    name: newCategory.name,
                    color: colorName,
                });

                setCategories((prevCategories) => [
                    ...prevCategories,
                    { categoryId: newCategoryId, name: newCategory.name, color: newCategory.color },
                ]);

                refreshCategories();
                alert("새 카테고리가 추가되었습니다.");
            }

            setNewCategory({ name: "", color: "" });
            setCategoryEditMode(false);
        } catch (error) {
            console.error("Error handling category:", error);
            alert("카테고리 처리 중 오류가 발생했습니다.");
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await deleteCategory(categoryId);

            setCategories((prevCategories) =>
                prevCategories.filter((category) => category.categoryId !== categoryId)
            );

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.categoryId === categoryId
                        ? {
                            ...event,
                            categoryId: 1,
                            backgroundColor:
                                categories.find((cat) => cat.categoryId === 1)?.color || "#CCCCCC",
                        }
                        : event
                )
            );

            refreshTodayTasks();
            refreshCategories();
            alert("카테고리가 성공적으로 삭제되었습니다.");
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("카테고리 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleEditCategory = (category) => {
        const matchingColor = colors.find(
            (color) => color.code.toUpperCase() === category.color.toUpperCase()
        );

        setNewCategory({
            id: category.categoryId,
            name: category.name,
            color: matchingColor ? matchingColor.value : "",
        });
        setCategoryEditMode(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded shadow-lg w-[700px] h-[600px] flex flex-col justify-between">
                <h2 className="text-3xl font-bold mb-8 text-center">카테고리 관리</h2>
                <ul className="flex-grow flex flex-col gap-4 overflow-auto">
                    {categories.map((category) => {
                        const isDefault = colors.some(
                            (color) =>
                                color.code.toUpperCase() === category.color.toUpperCase() && color.isDefault
                        );

                        return (
                            <li
                                key={category.categoryId}
                                className="flex items-center justify-between bg-gray-200 p-3 rounded"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        style={{
                                            backgroundColor: category.color,
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '50%',
                                        }}
                                    ></span>
                                    <p className="text-lg">{category.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => !isDefault && handleEditCategory(category)}
                                        className={`px-4 py-2 rounded ${
                                            isDefault
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                : 'bg-yellow-500 text-white'
                                        }`}
                                        disabled={isDefault}
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => !isDefault && handleDeleteCategory(category.categoryId)}
                                        className={`px-4 py-2 rounded ${
                                            isDefault
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                : 'bg-red-500 text-white'
                                        }`}
                                        disabled={isDefault}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">
                        {categoryEditMode ? '카테고리 수정' : '새 카테고리 추가'}
                    </h3>
                    <input
                        type="text"
                        name="name"
                        placeholder="카테고리 이름"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="border rounded p-3 mb-4 w-full"
                    />
                    <div className="relative">
                        <button
                            className="border rounded p-3 mb-4 w-full flex justify-between items-center"
                            onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    style={{
                                        backgroundColor: newCategory.color,
                                        width: '15px',
                                        height: '15px',
                                        borderRadius: '50%',
                                    }}
                                ></span>
                                {getColorName(newCategory.color)}
                            </div>
                            <span>{colorDropdownOpen ? '▲' : '▼'}</span>
                        </button>
                        {colorDropdownOpen && (
                            <ul className="absolute z-10 bg-white border rounded shadow-md w-full">
                                {colors.map((color) => (
                                    <li
                                        key={color.value}
                                        onClick={() => {
                                            setNewCategory({ ...newCategory, color: color.value });
                                            setColorDropdownOpen(false);
                                        }}
                                        className="p-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        <span
                                            style={{
                                                backgroundColor: color.code,
                                                width: '15px',
                                                height: '15px',
                                                borderRadius: '50%',
                                            }}
                                        ></span>
                                        {color.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={handleCategorySubmit}
                            className="px-6 py-3 bg-green-500 text-white rounded"
                        >
                            {categoryEditMode ? '수정' : '추가'}
                        </button>
                        {categoryEditMode && (
                            <button
                                onClick={() => {
                                    setNewCategory({ name: '', color: '' });
                                    setCategoryEditMode(false);
                                }}
                                className="px-6 py-3 bg-gray-500 text-white rounded"
                            >
                                취소
                            </button>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 px-6 py-3 bg-gray-500 text-white rounded self-end"
                >
                    닫기
                </button>
            </div>
        </div>
    );
};

export default CategoryManagementModal;
