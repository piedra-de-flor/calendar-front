import React, { useState, useEffect } from 'react';
import moment from 'moment';

const TaskEditModal = ({ isOpen, onClose, onSubmit, task, categories }) => {
    const [editTask, setEditTask] = useState({
        taskId: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        categoryId: '',
        categoryDropdownOpen: false,
    });

    useEffect(() => {
        if (task) {
            setEditTask({
                taskId: task.taskId || '',
                date: task.date || moment(task.start).format('YYYY-MM-DD'),
                startTime: task.startTime || moment(task.start).format('HH:mm'),
                endTime: task.endTime || moment(task.end).format('HH:mm'),
                description: task.description || '',
                categoryId: task.categoryId != null ? task.categoryId : 1,
                categoryDropdownOpen: false,
            });
        }
    }, [task]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">일정 수정</h2>
                <div className="flex flex-col gap-6">
                    <input
                        type="text"
                        name="description"
                        placeholder="일정 설명"
                        value={editTask.description || ''}
                        onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <input
                        type="date"
                        name="date"
                        value={editTask.date || ''}
                        onChange={(e) => setEditTask({ ...editTask, date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <div className="flex gap-6">
                        <input
                            type="time"
                            name="startTime"
                            value={editTask.startTime || ''}
                            onChange={(e) => setEditTask({ ...editTask, startTime: e.target.value })}
                            className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <input
                            type="time"
                            name="endTime"
                            value={editTask.endTime || ''}
                            onChange={(e) => setEditTask({ ...editTask, endTime: e.target.value })}
                            className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() =>
                                setEditTask({ ...editTask, categoryDropdownOpen: !editTask.categoryDropdownOpen })
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-left flex justify-between items-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {categories.find((cat) => String(cat.categoryId) === String(editTask.categoryId)) ? (
                                <span className="flex items-center gap-2">
                                    <span
                                        style={{
                                            backgroundColor: categories.find(
                                                (cat) => String(cat.categoryId) === String(editTask.categoryId)
                                            )?.color,
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                        }}
                                    ></span>
                                    {
                                        categories.find((cat) => String(cat.categoryId) === String(editTask.categoryId))
                                            ?.name
                                    }
                                </span>
                            ) : (
                                '카테고리를 선택하세요'
                            )}
                            <span className="ml-2">{editTask.categoryDropdownOpen ? '▲' : '▼'}</span>
                        </button>
                        {editTask.categoryDropdownOpen && (
                            <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-auto">
                                {categories.map((category) => (
                                    <li
                                        key={category.categoryId}
                                        onClick={() =>
                                            setEditTask({
                                                ...editTask,
                                                categoryId: category.categoryId,
                                                categoryDropdownOpen: false,
                                            })
                                        }
                                        className={`flex items-center gap-2 p-3 cursor-pointer ${
                                            editTask.categoryId === category.categoryId
                                                ? 'bg-blue-100'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        <span
                                            style={{
                                                backgroundColor: category.color,
                                                width: '15px',
                                                height: '15px',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                            }}
                                        ></span>
                                        <p className="text-sm">{category.name}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => onSubmit(editTask)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskEditModal;
