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

    // task 변경 시 editTask 초기화
    useEffect(() => {
        if (task) {
            console.log('Task received in Modal:', task); // 디버깅용 로그
            setEditTask({
                taskId: task.taskId || '',
                date: task.date || moment(task.start).format('YYYY-MM-DD'), // task.date가 없으면 task.start로 초기화
                startTime: task.startTime || moment(task.start).format('HH:mm'), // 현재 시간이 아닌 task.start로 초기화
                endTime: task.endTime || moment(task.end).format('HH:mm'), // task.end로 초기화
                description: task.description || '',
                categoryId: task.categoryId != null ? task.categoryId : 1, // 기본값 1 설정
                categoryDropdownOpen: false,
            });
        }
    }, [task]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-lg font-bold mb-4">일정 수정</h2>
                <div className="flex flex-col gap-2">
                    {/* 일정 설명 */}
                    <input
                        type="text"
                        name="description"
                        placeholder="일정 설명"
                        value={editTask.description || ''} // 기본값 처리
                        onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                        className="border rounded p-2"
                    />

                    <input
                        type="date"
                        name="date"
                        value={editTask.date || ''} // 기본값 처리
                        onChange={(e) => setEditTask({...editTask, date: e.target.value})}
                        className="border rounded p-2"
                    />

                    <input
                        type="time"
                        name="startTime"
                        value={editTask.startTime || ''} // 기본값 처리
                        onChange={(e) => setEditTask({...editTask, startTime: e.target.value})}
                        className="border rounded p-2"
                    />

                    <input
                        type="time"
                        name="endTime"
                        value={editTask.endTime || ''} // 기본값 처리
                        onChange={(e) => setEditTask({...editTask, endTime: e.target.value})}
                        className="border rounded p-2"
                    />

                    {/* 카테고리 선택 */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setEditTask({
                                    ...editTask,
                                    categoryDropdownOpen: !editTask.categoryDropdownOpen,
                                })
                            }
                            className="border rounded p-2 w-full text-left flex justify-between items-center"
                        >
                            {categories.find((cat) => String(cat.categoryId) === String(editTask.categoryId)) ? (
                                <span className="flex items-center gap-2">
                                    <span
                                        style={{
                                            backgroundColor: categories.find((cat) => String(cat.categoryId) === String(editTask.categoryId))?.color,
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                        }}
                                    ></span>
                                    {categories.find((cat) => String(cat.categoryId) === String(editTask.categoryId))?.name}
                                </span>
                            ) : (
                                '카테고리를 선택하세요'
                            )}
                            <span className="ml-2">{editTask.categoryDropdownOpen ? '▲' : '▼'}</span>
                        </button>
                        {editTask.categoryDropdownOpen && (
                            <ul className="absolute border rounded mt-1 bg-white shadow-lg w-full max-h-40 overflow-auto z-10">
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
                                        className={`flex items-center gap-2 p-2 cursor-pointer ${
                                            editTask.categoryId === category.categoryId ? 'bg-gray-200' : ''
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

                {/* 버튼 */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => onSubmit(editTask)}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskEditModal;
