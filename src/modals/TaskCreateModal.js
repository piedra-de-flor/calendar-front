import React, { useState } from 'react';
import moment from 'moment';
import CategoryManagementModal from './CategoryManagementModal'; // CategoryManagementModal 추가
import { createTask } from "../api/CalendarApi";
import {useAlert} from "../root/AlertProvider"; // createTask API 함수 추가

const TaskCreateModal = ({ isOpen, onClose, selectedRange, categories, setEvents, refreshTodayTasks, refreshCategories , setCategories }) => {
    const { addAlert } = useAlert();
    const [newTask, setNewTask] = useState({
        description: '',
        startTime: '',
        endTime: '',
        categoryId: null,
    });
    const [categoryModalOpen, setCategoryModalOpen] = useState(false); // 카테고리 관리 모달 상태
    const [error, setError] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleTaskSubmit = async () => {
        try {
            const selectedCategory = categories.find((category) => category.categoryId === newTask.categoryId);
            if (!selectedCategory) {
                alert('유효하지 않은 카테고리입니다.');
                return;
            }

            const startDate = moment(selectedRange.start);
            const endDate = moment(selectedRange.end).subtract(1, 'days'); // 마지막 날 포함

            const dateRange = startDate.isSame(endDate, 'day')
                ? [startDate.format('YYYY-MM-DD')]
                : [];
            if (!dateRange.length) {
                for (let date = startDate; date.isSameOrBefore(endDate); date.add(1, 'days')) {
                    dateRange.push(date.format('YYYY-MM-DD'));
                }
            }

            const createdEvents = await Promise.all(
                dateRange.map(async (date) => {
                    const response = await createTask({
                        categoryId: newTask.categoryId,
                        date,
                        startTime: newTask.startTime,
                        endTime: newTask.endTime,
                        description: newTask.description,
                    });

                    return {
                        id: response.data,
                        title: newTask.description,
                        start: moment(`${date}T${newTask.startTime}`).toDate(),
                        end: moment(`${date}T${newTask.endTime}`).toDate(),
                        backgroundColor: selectedCategory.color,
                    };
                })
            );

            setEvents((prevEvents) => [...prevEvents, ...createdEvents]);
            refreshTodayTasks(); // 오늘의 작업 리스트 새로고침
            onClose();
        } catch (error) {
            console.error('Error creating tasks:', error);
            setError('Failed to create tasks. Please try again.');
            addAlert("일정 생성 중 오류가 발생했습니다, 잠시 후 다시 시도해주세요.")
        }
    };

    if (!isOpen) return null;

    const renderDateDisplay = () => {
        const start = moment(selectedRange.start);
        const end = moment(selectedRange.end).subtract(1, 'days'); // 마지막 날 포함

        return start.isSame(end, 'day')
            ? start.format('YYYY-MM-DD') // 단일 날짜
            : `${start.format('YYYY-MM-DD')} ~ ${end.format('YYYY-MM-DD')}`; // 범위
    };

    return (
        <>
            {/* 일정 생성 모달 */}
            {!categoryModalOpen && isOpen && (
                <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded shadow-lg w-[700px] h-[600px] flex flex-col justify-between">
                        <h2 className="text-3xl font-bold mb-8 text-center">새 일정 추가</h2>
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        <div className="flex-grow flex flex-col gap-6">
                            {/* 선택된 날짜 표시 */}
                            <p className="text-lg text-center text-gray-700">
                                선택된 날짜: <span className="font-semibold text-gray-900">{renderDateDisplay()}</span>
                            </p>
                            {/* 일정 설명 */}
                            <input
                                type="text"
                                placeholder="일정 설명"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="border rounded w-full p-3 text-lg"
                            />
                            {/* 시간 선택 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-xl font-medium">시작 시간</label>
                                    <input
                                        type="time"
                                        value={newTask.startTime}
                                        onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                                        className="border rounded w-full p-3 text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xl font-medium">종료 시간</label>
                                    <input
                                        type="time"
                                        value={newTask.endTime}
                                        onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                                        className="border rounded w-full p-3 text-lg"
                                    />
                                </div>
                            </div>
                            {/* 카테고리 선택 */}
                            <div>
                                <label className="block mb-2 text-xl font-medium">카테고리</label>
                                <div className="relative">
                                    <button
                                        className="border rounded p-3 w-full flex justify-between items-center"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {newTask.categoryId && (
                                                <span
                                                    style={{
                                                        backgroundColor:
                                                            categories.find(
                                                                (cat) => cat.categoryId === newTask.categoryId
                                                            )?.color || '#ccc',
                                                        width: '15px',
                                                        height: '15px',
                                                        borderRadius: '50%',
                                                    }}
                                                ></span>
                                            )}
                                            {
                                                categories.find(
                                                    (cat) => cat.categoryId === newTask.categoryId
                                                )?.name || '카테고리를 선택하세요'
                                            }
                                        </div>
                                        <span>{dropdownOpen ? '▲' : '▼'}</span>
                                    </button>
                                    {dropdownOpen && (
                                        <ul className="absolute z-10 bg-white border rounded shadow-md w-full">
                                            {categories.map((category) => (
                                                <li
                                                    key={category.categoryId}
                                                    onClick={() => {
                                                        setNewTask({ ...newTask, categoryId: category.categoryId });
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="p-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                                                >
                                                    <span
                                                        style={{
                                                            backgroundColor: category.color,
                                                            width: '15px',
                                                            height: '15px',
                                                            borderRadius: '50%',
                                                        }}
                                                    ></span>
                                                    {category.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-6">
                            {/* 카테고리 관리 버튼 */}
                            <button
                                onClick={() => setCategoryModalOpen(true)}
                                className="px-4 py-2 text-blue-500 text-lg underline"
                            >
                                카테고리 관리
                            </button>
                            <div className="flex gap-4">
                                <button onClick={onClose} className="px-6 py-3 bg-gray-500 text-white rounded text-lg">
                                    취소
                                </button>
                                <button
                                    onClick={handleTaskSubmit}
                                    className="px-6 py-3 bg-green-500 text-white rounded text-lg"
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 카테고리 관리 모달 */}
            {categoryModalOpen && (
                <CategoryManagementModal
                    isOpen={categoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                    categories={categories}
                    setCategories={setCategories} // 전달
                    setEvents={setEvents}
                    refreshTodayTasks={refreshTodayTasks}
                    refreshCategories={refreshCategories}
                />
            )}
        </>
    );
};

export default TaskCreateModal;
