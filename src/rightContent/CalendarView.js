import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskCreateModal from '../modals/TaskCreateModal';
import ContextMenu from '../common/ContextMenu';
import TaskEditModal from "../modals/TaskEditModal"; // ContextMenu 컴포넌트 추가

import {
    fetchCalendarEvents,
    fetchCategories,
    deleteTask,
    updateTask,
    updateTaskCategory,
} from "../api/CalendarApi";

const localizer = momentLocalizer(moment);

const CalendarView = ({ refreshTodayTasks }) => {
    const [events, setEvents] = useState([]); // 캘린더 이벤트 데이터
    const [categories, setCategories] = useState([]); // 카테고리 데이터
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date()); // 현재 캘린더 날짜
    const [currentView, setCurrentView] = useState('month'); // 현재 캘린더 뷰
    const [modalOpen, setModalOpen] = useState(false); // 모달 열림 상태
    const [selectedRange, setSelectedRange] = useState(null); // 선택한 날짜 범위
    const [contextMenu, setContextMenu] = useState(null); // 컨텍스트 메뉴 상태
    const [selectedEvent, setSelectedEvent] = useState(null); // 선택된 일정

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTask, setEditTask] = useState(null);

    // 일정 데이터 요청 함수
    const fetchEvents = async ({ startDate, endDate }) => {
        setLoading(true);
        try {
            const response = await fetchCalendarEvents({ startDate, endDate });
            const fetchedEvents = response.data.taskDtos.flatMap((dailyTask, dayIndex) =>
                dailyTask.taskDtos.map((task) => {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + dayIndex);

                    const [startHour, startMinute] = task.start.split(":").map(Number);
                    const [endHour, endMinute] = task.end.split(":").map(Number);

                    return {
                        id: task.taskId,
                        title: task.description,
                        start: new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            startHour,
                            startMinute
                        ),
                        end: new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            endHour,
                            endMinute
                        ),
                        backgroundColor: task.categoryColor,
                        categoryId: task.categoryId,
                    };
                })
            );

            setEvents(fetchedEvents);
        } catch (err) {
            console.error("Failed to load calendar events:", err);
        } finally {
            setLoading(false);
        }
    };

    // 카테고리 데이터 요청 함수
    const loadCategories = async () => {
        try {
            const categoryResponse = await fetchCategories();
            setCategories(categoryResponse.data);
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    };

    // 날짜 범위 계산 및 데이터 로드
    const calculateDateRangeAndFetch = (date, view) => {
        let startDate, endDate;

        if (view === 'month') {
            startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        } else if (view === 'week') {
            startDate = moment(date).startOf('week').toDate();
            endDate = moment(date).add(1, 'week').startOf('week').toDate();
        } else if (view === 'day') {
            startDate = new Date(date);
            endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        // React-Big-Calendar 시간대를 UTC로 보정
        startDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        endDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

        fetchEvents({ startDate, endDate });
    };

    // 캘린더 이동 이벤트 핸들러
    const handleNavigate = (newDate) => {
        setCurrentDate(newDate);
        calculateDateRangeAndFetch(newDate, currentView);
    };

    // 뷰 변경 이벤트 핸들러
    const handleViewChange = (newView) => {
        setCurrentView(newView);
        calculateDateRangeAndFetch(currentDate, newView);
    };

    // 빈 날짜를 클릭하거나 여러 날짜를 드래그하여 선택했을 때
    const handleSelectSlot = (slotInfo) => {
        setSelectedRange({ start: slotInfo.start, end: slotInfo.end }); // 선택한 날짜 범위 저장
        setModalOpen(true); // 모달 열기
    };

    const handleEventContextMenu = (event, e) => {
        e.preventDefault(); // 기본 컨텍스트 메뉴 방지
        console.log('Right-clicked on event:', event); // 확인 로그 추가

        setSelectedEvent(event); // 선택된 이벤트 저장
        setContextMenu({
            mouseX: e.clientX,
            mouseY: e.clientY,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
        setSelectedEvent(null);
    };

    const handleDeleteTask = async () => {
        if (!selectedEvent) return;

        try {
            await deleteTask(selectedEvent.id);
            setEvents(events.filter((event) => event.id !== selectedEvent.id));
            handleCloseContextMenu();
            refreshTodayTasks();
            setContextMenu(null); // 컨텍스트 메뉴 닫기
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const handleEditTask = () => {
        if (!selectedEvent) return; // selectedEvent가 null일 경우 중단
        console.log('Selected Event:', selectedEvent); // 선택된 이벤트 정보 확인

        setEditModalOpen(true); // 수정 모달 열기
        setEditTask({
            taskId: selectedEvent.id,
            date: moment(selectedEvent.start).format('YYYY-MM-DD'),
            startTime: moment(selectedEvent.start).format('HH:mm'),
            endTime: moment(selectedEvent.end).format('HH:mm'),
            description: selectedEvent.title,
            categoryId: selectedEvent.categoryId || null, // 카테고리가 없을 경우 대비
        });
        setContextMenu(null); // 컨텍스트 메뉴 닫기
    };

    const handleEditSubmit = async (updatedTask) => {
        try {
            await updateTask(updatedTask);

            if (updatedTask.categoryId) {
                await updateTaskCategory(updatedTask.taskId, updatedTask.categoryId);
            }

            // 서버에서 반환된 데이터로 캘린더 이벤트 업데이트
            const updatedEvents = events.map((event) =>
                event.id === updatedTask.taskId
                    ? {
                        ...event,
                        title: updatedTask.description,
                        start: moment(`${updatedTask.date}T${updatedTask.startTime}`).toDate(),
                        end: moment(`${updatedTask.date}T${updatedTask.endTime}`).toDate(),
                        backgroundColor: categories.find(
                            (cat) => cat.categoryId === updatedTask.categoryId
                        )?.color || event.backgroundColor,
                    }
                    : event
            );
            setEvents(updatedEvents);
            refreshTodayTasks();
            setEditModalOpen(false); // 수정 모달 닫기
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const contextMenuOptions = [
        { label: '삭제', onClick: handleDeleteTask },
        { label: '수정', onClick: handleEditTask },
    ];

    const CustomEvent = ({ event, handleEventContextMenu }) => {
        return (
            <div
                onContextMenu={(e) => handleEventContextMenu(event, e)} // 우클릭 핸들링
                style={{
                    backgroundColor: event.backgroundColor || '#3174ad',
                    color: 'white',
                    borderRadius: '3px',
                    padding: '2px 4px',
                    height: '18px', // 줄인 높이
                    lineHeight: '18px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                }}
            >
                {event.title}
            </div>
        );
    };

    useEffect(() => {
        calculateDateRangeAndFetch(currentDate, currentView);
        loadCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenu) {
                setContextMenu(null);
                setSelectedEvent(null);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu]);


    if (loading) {
        return <div>Loading calendar events...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="calendar-view" style={{ height: '100%', width: '100%' }}
             onContextMenu={(e) => e.preventDefault()} // 전체 영역에서 기본 컨텍스트 메뉴 방지
            >
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: '80vh', width: '100%' }}
                views={['month', 'week']}
                selectable
                onSelectSlot={handleSelectSlot}
                eventPropGetter={(event) => ({
                    style: {
                        backgroundColor: event.backgroundColor || '#3174ad',
                        color: 'white',
                        borderRadius: '3px',
                        padding: '2px 4px', // 패딩 줄이기
                        height: '26px', // 높이 줄이기
                        lineHeight: '20px', // 텍스트 정렬
                        overflow: 'hidden', // 텍스트 잘리게 하기
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    },
                })}

                components={{
                    event: (props) => (
                        <CustomEvent {...props} handleEventContextMenu={handleEventContextMenu} />
                    ),
                }}

                onNavigate={handleNavigate}
                view={currentView}
                onView={handleViewChange}
                date={currentDate}
                dayLayoutAlgorithm="no-overlap"
                popup
            />

            {/* 일정 생성 모달 */}
            {modalOpen && (
                <TaskCreateModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    selectedRange={selectedRange}
                    categories={categories}
                    setEvents={setEvents}
                    refreshTodayTasks={refreshTodayTasks} // TODO 리스트 새로고침
                    setCategories={setCategories} // 수정
                />
            )}

            {/* 컨텍스트 메뉴 */}
            <ContextMenu
                contextMenu={contextMenu}
                options={contextMenuOptions}
                onClose={handleCloseContextMenu}
            />

            <TaskEditModal
                isOpen={editModalOpen && editTask !== null} // 조건 추가
                onClose={() => setEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                task={editTask}
                categories={categories}
            />
        </div>
    );
};

export default CalendarView;
