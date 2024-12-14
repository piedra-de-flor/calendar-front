import React, {useEffect, useState} from 'react';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FaBell } from 'react-icons/fa'; // 종모양 아이콘 추가 (react-icons 사용)

const localizer = momentLocalizer(moment);

export default function MainPage() {
    const [userInfo, setUserInfo] = useState({name: '', email: ''});
    const [events, setEvents] = useState([]); // 캘린더 이벤트 데이터
    const [todayTasks, setTodayTasks] = useState([]); // 오늘의 작업 데이터
    const [friends, setFriends] = useState([]); // 친구 목록
    const [teams, setTeams] = useState([]); // 팀 목록
    const [modalOpen, setModalOpen] = useState(false); // 일정 생성 모달 상태
    const [editModalOpen, setEditModalOpen] = useState(false); // 일정 수정 모달 상태
    const [categoryModalOpen, setCategoryModalOpen] = useState(false); // 카테고리 추가 모달 상태
    const [categoryEditMode, setCategoryEditMode] = useState(false); // 수정 모드 여부
    const [selectedDate, setSelectedDate] = useState(null); // 클릭한 날짜
    const [selectedTask, setSelectedTask] = useState(null); // 선택된 일정 데이터
    const [newTask, setNewTask] = useState({
        categoryId: '', description: '', startTime: '', endTime: '',
    }); // 새 일정 데이터
    const [editTask, setEditTask] = useState({}); // 수정할 일정 데이터
    const [newCategory, setNewCategory] = useState({name: '', color: ''}); // 새 카테고리 데이터
    const [categories, setCategories] = useState([]); // 카테고리 데이터
    const [contextMenu, setContextMenu] = useState(null); // 우클릭 메뉴 상태
    const [activeTab, setActiveTab] = useState('today'); // 현재 활성화된 탭 (today or community)
    const [activeView, setActiveView] = useState('calendar'); // 기본 캘린더 뷰
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newFriendEmail, setNewFriendEmail] = useState(''); // 추가할 친구 이메일
    const [sentFriendRequests, setSentFriendRequests] = useState([]); // 보낸 요청 상태
    const [receivedFriendRequests, setReceivedFriendRequests] = useState([]); // 받은 요청 상태
    const [friendContextMenu, setFriendContextMenu] = useState(null); // 우클릭 메뉴 상태
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ // 삭제 확인 모달 상태
        visible: false,
        friendId: null,
    });

    const [sentTeamRequests, setSentTeamRequests] = useState([]); // 보낸 요청 상태
    const [receivedTeamRequests, setReceivedTeamRequests] = useState([]); // 받은 요청 상태
    const [teamContextMenu, setTeamContextMenu] = useState(null); // 컨텍스트 메뉴 상태
    const [newTeamName, setNewTeamName] = useState(''); // 새 팀 이름 입력
    const [createTeamModalVisible, setCreateTeamModalVisible] = useState(false); // 팀 생성 모달
    const [selectedFriends, setSelectedFriends] = useState([]); // 팀 생성 친구 선택 리스트
    const [leaveConfirmModal, setLeaveConfirmModal] = useState({ // 탈퇴 확인 모달 상태
        visible: false,
        teamId: null,
    });
    const [addFriendInTeamModalVisible, setAddFriendInTeamModalVisible] = useState(false); // 멤버 추가 모달 표시 상태
    const [selectedTeamId, setSelectedTeamId] = useState(null); // 현재 선택된 팀 ID
    const [friendEmail, setFriendEmail] = useState(''); // 이메일 입력 상태
    const [teamMembersContext, setTeamMembersContext] = useState({ // 팀 멤버들
        visible: false,
        members: [],
        teamId: null,
        x: 0,
        y: 0,
    });

    const [isNotificationOpen, setIsNotificationOpen] = useState(false); // 알림 창 열림/닫힘 상태
    const [notifications, setNotifications] = useState([]); // 알림 데이터
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
    const [hasMore, setHasMore] = useState(true); // 추가 페이지 여부
    const [eventSource, setEventSource] = useState(null); // SSE 연결 객체



    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const accessToken = params.get('accessToken');
                if (!accessToken) throw new Error('Access token is missing.');

                // 사용자 정보 가져오기
                const userResponse = await axios.get('http://localhost:8080/member', {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                setUserInfo(userResponse.data);

                // 친구 목록 가져오기
                const friendsResponse = await axios.get('http://localhost:8080/my-friends', {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                setFriends(friendsResponse.data);

                // 팀 목록 가져오기
                const teamsResponse = await axios.get('http://localhost:8080/my-teams', {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                setTeams(teamsResponse.data);

                // 카테고리 데이터 가져오기
                const categoryResponse = await axios.get('http://localhost:8080/schedule/category', {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                setCategories(categoryResponse.data);

                const now = new Date();
                const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];

                // 월간 작업 데이터 가져오기
                const monthlyTasksResponse = await axios.get('http://localhost:8080/schedule/task/month', {
                    headers: {Authorization: `Bearer ${accessToken}`}, params: {startDate, endDate},
                });

                const fetchedEvents = [];
                monthlyTasksResponse.data.taskDtos.forEach((dailyTask, index) => {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + index); // 날짜 이동

                    dailyTask.taskDtos.forEach((task) => {
                        const start = new Date(date);
                        start.setHours(task.start.split(':')[0], task.start.split(':')[1]);

                        const end = new Date(date);
                        end.setHours(task.end.split(':')[0], task.end.split(':')[1]);

                        fetchedEvents.push({
                            id: task.taskId, // taskId 추가
                            title: task.description, start, end, backgroundColor: task.categoryColor,
                            categoryId: task.categoryId,
                        });
                    });
                });

                setEvents(fetchedEvents);

                // 오늘의 작업 데이터 가져오기
                const today = new Date();
                const kstTodayDate = new Date(today.getTime() + 9 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0];
                const todayTasksResponse = await axios.get('http://localhost:8080/schedule/task/day', {
                    headers: {Authorization: `Bearer ${accessToken}`}, params: {date: kstTodayDate},
                });

                const updatedTasks = todayTasksResponse.data.taskDtos.map((task) => ({
                    ...task, id: task.taskId, // taskId 추가
                }));

                setTodayTasks(updatedTasks);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // 클릭한 요소가 메뉴 내부가 아닌 경우 메뉴 닫기
            if (contextMenu && !event.target.closest('.context-menu')) {
                setContextMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [contextMenu]);

    useEffect(() => {
        fetchFriendRequests(); // 친구 요청 데이터를 초기 로드
        fetchTeamRequests(); // 팀 요청 데이터를 초기 로드
    }, []);

    const handleRightClick = (e, task) => {
        e.preventDefault(); // 우클릭 기본 메뉴 비활성화
        setContextMenu({
            mouseX: e.clientX, mouseY: e.clientY,
        });
        setSelectedTask(task); // 선택된 일정 저장
    };

    const handleDeleteTask = async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            if (!accessToken) throw new Error('Access token is missing.');

            const response = await axios.delete('http://localhost:8080/schedule/task', {
                headers: {Authorization: `Bearer ${accessToken}`}, params: {taskId: selectedTask.id},
            });

            if (response.data) {
                // 일정 삭제 후 상태 업데이트
                setEvents(events.filter((event) => event.id !== selectedTask.id));
                setTodayTasks(todayTasks.filter((task) => task.id !== selectedTask.id));
                setContextMenu(null); // 컨텍스트 메뉴 닫기
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = () => {
        setEditModalOpen(true);
        setEditTask({
            taskId: selectedTask.id,
            date: moment(selectedTask.start).format('YYYY-MM-DD'),
            startTime: moment(selectedTask.start).format('HH:mm'),
            endTime: moment(selectedTask.end).format('HH:mm'),
            description: selectedTask.title,
            categoryId: selectedTask.categoryId, // 카테고리 ID 설정
        });
        setContextMenu(null); // 컨텍스트 메뉴 닫기
    };


    const handleEditSubmit = async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            if (!accessToken) throw new Error('Access token is missing.');

            // 수정 요청 전송
            const response = await axios.patch('http://localhost:8080/schedule/task', editTask, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            // Task 카테고리 업데이트 요청
            if (editTask.taskId && editTask.categoryId) {
                await axios.patch('http://localhost:8080/schedule/task/category', {
                    taskId: editTask.taskId,
                    categoryId: editTask.categoryId,
                }, {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
            }

            if (response.data) {
                // 캘린더 이벤트 업데이트
                const updatedEvents = events.map((event) => event.id === editTask.taskId ? {
                    ...event,
                    title: editTask.description,
                    start: moment(`${editTask.date}T${editTask.startTime}`).toDate(),
                    end: moment(`${editTask.date}T${editTask.endTime}`).toDate(),
                    backgroundColor: categories.find((cat) => cat.categoryId === editTask.categoryId)?.color || event.backgroundColor,
                } : event);
                setEvents(updatedEvents);

                // TODO 리스트 업데이트
                const updatedTasks = todayTasks.map((task) => task.id === editTask.taskId ? {
                    ...task,
                    description: editTask.description,
                    start: editTask.startTime,
                    end: editTask.endTime,
                    categoryColor: categories.find((cat) => cat.categoryId === editTask.categoryId)?.color || task.categoryColor,
                } : task);
                setTodayTasks(updatedTasks);

                setEditModalOpen(false); // 수정 모달 닫기
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };


    const handleEditCategory = (category) => {
        setNewCategory({id: category.categoryId, name: category.name, color: category.color}); // 올바르게 설정
        setCategoryEditMode(true);
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            if (!accessToken) throw new Error('Access token is missing.');

            // 카테고리 삭제 요청 (RequestParam 사용)
            await axios.delete('http://localhost:8080/schedule/category', {
                params: {categoryId}, // RequestParam으로 전달
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            // 카테고리 상태 업데이트
            const updatedCategories = categories.filter((category) => category.categoryId !== categoryId);
            setCategories(updatedCategories);

            // 캘린더 이벤트 업데이트
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.categoryId === categoryId
                        ? {
                            ...event,
                            categoryId: 1, // 기본 카테고리로 이동
                            backgroundColor: categories.find((cat) => cat.categoryId === 1)?.color || '#CCCCCC',
                        }
                        : event
                )
            );

            // TODO 리스트 업데이트
            setTodayTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.categoryId === categoryId
                        ? {
                            ...task,
                            categoryId: 1, // 기본 카테고리로 이동
                            category: categories.find((cat) => cat.categoryId === 1)?.name || '미분류',
                            categoryColor: categories.find((cat) => cat.categoryId === 1)?.color || '#CCCCCC',
                        }
                        : task
                )
            );

            alert('카테고리가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('카테고리 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleTaskSubmit = async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            if (!accessToken) throw new Error('Access token is missing.');

            const selectedCategory = categories.find((category) => category.categoryId === newTask.categoryId);

            if (!selectedCategory) {
                alert('유효하지 않은 카테고리입니다.');
                return;
            }

            // 서버로 새 태스크 생성 요청
            const response = await axios.post(
                'http://localhost:8080/schedule/task',
                {
                    categoryId: newTask.categoryId,
                    date: moment(selectedDate).format('YYYY-MM-DD'),
                    startTime: newTask.startTime,
                    endTime: newTask.endTime,
                    description: newTask.description,
                },
                {
                    headers: {Authorization: `Bearer ${accessToken}`},
                }
            );

            // 새로운 이벤트 추가
            const newEvent = {
                id: response.data, // 서버에서 반환된 태스크 ID
                title: newTask.description,
                start: moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${newTask.startTime}`).toDate(),
                end: moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${newTask.endTime}`).toDate(),
                backgroundColor: selectedCategory.color,
            };
            setEvents([...events, newEvent]);

            // TODO 리스트 업데이트
            const newTodoItem = {
                id: response.data, // 서버에서 반환된 태스크 ID
                description: newTask.description,
                date: moment(selectedDate).format('YYYY-MM-DD'),
                start: newTask.startTime,
                end: newTask.endTime,
                category: selectedCategory.name, // 카테고리 이름
                categoryColor: selectedCategory.color, // 카테고리 색상
            };
            setTodayTasks((prevTodayTasks) => [...prevTodayTasks, newTodoItem]); // TODO 리스트 업데이트

            // 모달 닫기 및 초기화
            setModalOpen(false);
            setNewTask({categoryId: '', description: '', startTime: '', endTime: ''});
        } catch (error) {
            console.error('Error creating task:', error);
            setError('Failed to create task. Please try again.');
        }
    };


    const handleCategorySubmit = async () => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        if (!accessToken) throw new Error('Access token is missing.');

        try {
            if (categoryEditMode) {
                if (!newCategory.id) {
                    alert('수정할 카테고리 ID가 없습니다.');
                    return;
                }

                // 카테고리 수정 요청
                const response = await axios.patch(
                    'http://localhost:8080/schedule/category',
                    {
                        categoryId: newCategory.id,
                        name: newCategory.name,
                        color: newCategory.color,
                    },
                    {
                        headers: {Authorization: `Bearer ${accessToken}`},
                    }
                );

                if (response.data) {
                    // 카테고리 상태 업데이트
                    setCategories((prevCategories) =>
                        prevCategories.map((cat) =>
                            cat.categoryId === newCategory.id
                                ? {...cat, name: newCategory.name, color: newCategory.color}
                                : cat
                        )
                    );

                    // 캘린더 이벤트 업데이트
                    setEvents((prevEvents) =>
                        prevEvents.map((event) =>
                            event.categoryId === newCategory.id
                                ? {
                                    ...event,
                                    backgroundColor: newCategory.color,
                                }
                                : event
                        )
                    );

                    // TODO 리스트 업데이트
                    setTodayTasks((prevTasks) =>
                        prevTasks.map((task) =>
                            task.categoryId === newCategory.id
                                ? {
                                    ...task,
                                    category: newCategory.name, // 카테고리 이름 업데이트
                                    categoryColor: newCategory.color, // 카테고리 색상 업데이트
                                }
                                : task
                        )
                    );

                    alert('카테고리가 성공적으로 수정되었습니다.');
                }
            } else {
                // 새 카테고리 추가 요청
                const response = await axios.post(
                    'http://localhost:8080/schedule/category',
                    {
                        name: newCategory.name,
                        color: newCategory.color,
                    },
                    {
                        headers: {Authorization: `Bearer ${accessToken}`},
                    }
                );

                if (response.data) {
                    setCategories([...categories, {
                        id: response.data,
                        name: newCategory.name,
                        color: newCategory.color
                    }]);
                    alert('새 카테고리가 추가되었습니다.');
                }
            }

            // 초기화 및 모달 닫기
            setNewCategory({name: '', color: ''});
            setCategoryEditMode(false);
            setCategoryModalOpen(false);
        } catch (error) {
            console.error('Error handling category:', error);
            alert('카테고리 처리 중 오류가 발생했습니다.');
        }
    };

    const fetchFriends = async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            if (!accessToken) throw new Error("Access token is missing.");

            const response = await axios.get("http://localhost:8080/my-friends", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            setFriends(response.data);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    const fetchFriendRequests = async () => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        try {
            const sentResponse = await axios.get("http://localhost:8080/invitations/send/friend", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            setSentFriendRequests(sentResponse.data);

            const receivedResponse = await axios.get("http://localhost:8080/invitations/receive/friend", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            setReceivedFriendRequests(receivedResponse.data);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    };

    const handleAddFriend = async () => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        try {
            const response = await axios.post(
                "http://localhost:8080/invitation/friend",
                {receiverEmail: newFriendEmail},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data) {
                alert("친구 요청이 성공적으로 전송되었습니다.");
                setNewFriendEmail("");
                await fetchFriendRequests(); // 요청 상태 업데이트
            } else {
                alert("친구 요청을 보내는 데 실패했습니다.");
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            alert("친구 요청 중 오류가 발생했습니다.");
        }
    };

    const renderFriendsManage = () => {
        return (
            <div className="p-6 flex h-full gap-8">
                {/* 왼쪽 섹션 */}
                <div className="flex flex-col w-1/3 gap-4 relative">
                    {deleteConfirmModal.visible && (
                        <div
                            className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <div
                                className="bg-white rounded p-6 shadow-lg"
                                style={{width: '300px'}}
                                onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 방지
                            >
                                <h2 className="text-lg font-bold mb-4">삭제 확인</h2>
                                <p className="mb-6">정말로 삭제하시겠습니까?</p>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={handleCancelDelete}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 캘린더로 돌아가기 버튼 */}
                    <div className="absolute top-0 left-0">
                        <button
                            className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-blue-500"
                            onClick={() => setActiveView("calendar")}
                            title="캘린더로 돌아가기"
                        >
                            ←
                        </button>
                    </div>

                    {/* 친구 관리 섹션 */}
                    <div className="bg-gray-200 rounded p-4 flex flex-col mt-16 h-3/4">
                        <h2 className="text-xl font-bold mb-4 text-center">친구 관리</h2>
                        <div className="overflow-y-auto flex-grow">
                            {friends.length > 0 ? (
                                friends.map((friend, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-4 mb-2 rounded shadow text-center relative"
                                        onContextMenu={(e) => handleFriendRightClick(e, friend)}
                                    >
                                        <p className="text-lg font-semibold">{friend.name}</p>
                                        <p className="text-gray-500">{friend.email}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">친구가 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 오른쪽 섹션 */}
                <div className="flex flex-col w-2/3">
                    {/* 친구 추가 섹션 */}
                    <div className="flex items-center bg-gray-200 rounded p-4" style={{marginTop: "4rem"}}>
                        <label htmlFor="email" className="text-lg font-semibold mr-4">
                            Email
                        </label>
                        <input
                            id="email"
                            type="text"
                            placeholder="Enter Email"
                            className="flex-grow border rounded p-2"
                            value={newFriendEmail}
                            onChange={(e) => setNewFriendEmail(e.target.value)}
                        />
                        <button
                            onClick={handleAddFriend}
                            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            친구 추가
                        </button>
                    </div>

                    {/* 받은 친구 요청 섹션 */}
                    <div className="bg-gray-200 rounded p-4 mt-4 overflow-y-auto max-h-40">
                        <h3 className="text-lg font-semibold mb-2">받은 친구 요청</h3>
                        {receivedFriendRequests.length > 0 ? (
                            receivedFriendRequests.map((request, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-2 mb-2 rounded shadow flex justify-between items-center"
                                >
                                <span>
                                    {request.senderName
                                        ? `${request.senderName} (${request.senderEmail})`
                                        : request.senderEmail}
                                </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAcceptRequest(request)}
                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            수락
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request)}
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            거절
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">받은 요청이 없습니다.</p>
                        )}
                    </div>

                    {/* 보낸 친구 요청 섹션 */}
                    <div className="bg-gray-200 rounded p-4 mt-4 overflow-y-auto max-h-40">
                        <h3 className="text-lg font-semibold mb-2">보낸 친구 요청</h3>
                        {sentFriendRequests.length > 0 ? (
                            sentFriendRequests.map((request, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-2 mb-2 rounded shadow flex justify-between items-center"
                                >
                                <span>
                                    {request.receiverName
                                        ? `${request.receiverName} (${request.receiverEmail})`
                                        : request.receiverEmail}
                                </span>
                                    <button
                                        onClick={() => handleCancelRequest(request)}
                                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        취소
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">보낸 요청이 없습니다.</p>
                        )}
                    </div>
                </div>
                {friendContextMenu && (
                    <div
                        className="absolute bg-white shadow-lg rounded"
                        style={{
                            position: "absolute",
                            top: friendContextMenu.mouseY,
                            left: friendContextMenu.mouseX,
                            width: '120px',
                            height: '50px',
                            zIndex: 50,
                        }}
                        onClick={(e) => e.stopPropagation()} // 메뉴 클릭 시 이벤트 전파 방지
                    >
                        <button
                            onClick={() => handleDeleteFriendClick(friendContextMenu.friendId)}
                            className="w-full h-full hover:bg-gray-200 flex items-center justify-center"
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
        );
    };

// 버튼 클릭 핸들러 함수
    const handleAcceptRequest = async (request) => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            if (!accessToken) throw new Error("Access token is missing.");

            const response = await axios.post(
                "http://localhost:8080/invitation/accept",
                null, // POST 요청의 body는 없으므로 null
                {
                    headers: {Authorization: `Bearer ${accessToken}`},
                    params: {invitationId: request.id}, // 쿼리 스트링으로 전달
                }
            );
            if (response.status === 200) {
                alert("요청을 수락했습니다.");
                // 수락 후 목록 갱신
                await fetchFriendRequests();
                await fetchTeamRequests();
                await fetchFriends();
                await fetchTeams();
            }
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const handleRejectRequest = async (request) => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            if (!accessToken) throw new Error("Access token is missing.");

            const response = await axios.post(
                "http://localhost:8080/invitation/denied",
                null, // POST 요청의 body는 없으므로 null
                {
                    headers: {Authorization: `Bearer ${accessToken}`},
                    params: {invitationId: request.id}, // 쿼리 스트링으로 전달
                }
            );
            if (response.status === 200) {
                alert("요청을 거절했습니다.");
                // 거절 후 목록 갱신
                await fetchFriendRequests();
                await fetchTeamRequests();
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const handleCancelRequest = async (request) => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            if (!accessToken) throw new Error("Access token is missing.");

            const response = await axios.delete("http://localhost:8080/invitation", {
                headers: {Authorization: `Bearer ${accessToken}`},
                params: {invitationId: request.id}, // invitationId를 RequestParam으로 전달
            });

            if (response.status === 200) {
                alert("보낸 요청을 취소했습니다.");
                // 취소 후 친구 요청 목록 갱신
                await fetchFriendRequests();
            }
        } catch (error) {
            console.error("Error cancelling request:", error);
            alert("요청 취소 중 오류가 발생했습니다.");
        }
    };

    // 삭제 버튼 클릭 핸들러
    const handleDeleteFriendClick = (friendId) => {
        setDeleteConfirmModal({
            visible: true,
            friendId: friendId,
        });

        setFriendContextMenu(null); // 컨텍스트 메뉴 닫기
    };

    // 삭제 확인 핸들러
    const handleConfirmDelete = async () => {
        try {
            const {friendId} = deleteConfirmModal; // 삭제할 친구 ID 가져오기
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            if (!accessToken) throw new Error('Access token is missing.');

            const response = await axios.delete('http://localhost:8080/friend', {
                headers: {Authorization: `Bearer ${accessToken}`}, params: {friendId},
            });

            if (response.data) {
                // 삭제 성공 시 친구 목록 갱신
                setFriends((prevFriends) => prevFriends.filter((friend) => friend.id !== friendId));
                setFriendContextMenu(null); // 컨텍스트 메뉴 닫기
            }

            setDeleteConfirmModal({
                visible: false,
                friendId: null,
            });
        } catch (error) {
            console.error('Error deleting friend:', error);
        }
    };

// 삭제 취소 핸들러
    const handleCancelDelete = () => {
        setDeleteConfirmModal({
            visible: false,
            friendId: null,
        });
    };

// 친구 오른쪽 클릭 핸들러
    const handleFriendRightClick = (e, friend) => {
        e.preventDefault(); // 기본 컨텍스트 메뉴 방지

        const targetElement = e.currentTarget; // 클릭된 요소
        const rect = targetElement.getBoundingClientRect(); // 요소의 위치 및 크기 정보

        const x = rect.right + 8; // 요소의 오른쪽 끝
        const y = rect.top; // 요소의 상단
        const width = rect.width; // 요소의 너비
        const height = rect.height; // 요소의 높이

        setFriendContextMenu({
            mouseX: x,
            mouseY: y,
            width: width, // 컨텍스트 메뉴 너비를 요소와 동일하게 설정
            height: height, // 컨텍스트 메뉴 높이를 요소와 동일하게 설정
            friendId: friend.id, // 선택된 친구 ID 저장
        });
    };

    const fetchTeams = async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            if (!accessToken) throw new Error("Access token is missing.");

            const response = await axios.get("http://localhost:8080/my-teams", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            setTeams(response.data);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };


    const fetchTeamRequests = async () => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        try {
            const sentResponse = await axios.get("http://localhost:8080/invitations/send/team", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            setSentTeamRequests(sentResponse.data);

            const receivedResponse = await axios.get("http://localhost:8080/invitations/receive/team", {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            setReceivedTeamRequests(receivedResponse.data);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    };

    //팀 관리
    const renderTeamsManage = () => (
        <div className="p-6 flex h-full gap-8">
            {/* 왼쪽 섹션: 그룹 관리 */}
            <div className="flex flex-col w-1/3 gap-4 relative">
                {/* 팀 탈퇴 확인 모달 */}
                {leaveConfirmModal.visible && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded p-6 shadow-lg w-1/3">
                            <h2 className="text-lg font-bold mb-4">팀 탈퇴 확인</h2>
                            <p className="mb-6">정말로 이 팀에서 탈퇴하시겠습니까?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleCancelLeaveTeam} // 취소 핸들러
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleConfirmLeaveTeam} // 탈퇴 확인 핸들러
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    탈퇴
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 캘린더로 돌아가기 버튼 */}
                <div className="absolute top-0 left-0">
                    <button
                        className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-blue-500"
                        onClick={() => setActiveView("calendar")}
                        title="캘린더로 돌아가기"
                    >
                        ←
                    </button>
                </div>

                <div className="bg-gray-200 rounded p-4 flex flex-col mt-16 h-3/4 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-center">그룹 관리</h2>
                    {teams.length > 0 ? (
                        teams.map((team) => (
                            <div
                                key={team.id}
                                className="bg-white p-4 mb-2 rounded shadow text-center relative"
                                onContextMenu={(e) => {
                                    handleContextMenu(e, team.teamId); // team.id 전달
                                }}
                            >
                                <p className="text-lg font-semibold">{team.name}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">그룹이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 오른쪽 섹션: 그룹 초대 */}
            <div className="flex flex-col w-2/3 relative">
                {/* 그룹 생성 버튼 */}
                <div className="flex items-center bg-gray-200 rounded p-4" style={{marginTop: "4rem"}}>
                    <button
                        onClick={() => setCreateTeamModalVisible(true)} // 모달 열기
                        className="w-full px-4 py-4 bg-blue-500 text-white text-lg rounded hover:bg-blue-600"
                    >
                        그룹 생성
                    </button>
                </div>

                {/* 그룹 초대 리스트 */}
                <div className="bg-gray-200 rounded p-4 mt-4 overflow-y-auto max-h-40">
                    <h3 className="text-lg font-semibold mb-2">받은 팀 합류 요청</h3>
                    {receivedTeamRequests.length > 0 ? (
                        receivedTeamRequests.map((request, index) => (
                            <div
                                key={index}
                                className="bg-white p-2 mb-2 rounded shadow flex justify-between items-center"
                            >
                <span>
                    {`${request.senderName || '알 수 없음'} (${request.senderEmail})님의 `}
                    <span className="font-bold text-blue-500">{request.teamName}</span>
                    그룹
                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptRequest(request)}
                                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        수락
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(request)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">받은 요청이 없습니다.</p>
                    )}
                </div>
                {/* 보낸 초대 리스트 */}
                <div className="bg-gray-200 rounded p-4 mt-4 overflow-y-auto max-h-40">
                    <h3 className="text-lg font-semibold mb-2">보낸 팀 합류 요청</h3>
                    {sentTeamRequests.length > 0 ? (
                        sentTeamRequests.map((request, index) => (
                            <div
                                key={index}
                                className="bg-white p-2 mb-2 rounded shadow flex justify-between items-center"
                            >
                                <span>
                                    {request.receiverName
                                        ? `${request.receiverName} (${request.receiverEmail})`
                                        : request.receiverEmail}
                                </span>
                                <button
                                    onClick={() => handleCancelRequest(request)}
                                    className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    취소
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">보낸 요청이 없습니다.</p>
                    )}
                </div>
            </div>

            {teamContextMenu && (
                <div
                    className="absolute bg-white shadow-lg rounded p-2"
                    style={{
                        top: teamContextMenu.y,
                        left: teamContextMenu.x,
                        zIndex: 50,
                        width: '155px',
                    }}
                    onClick={(e) => e.stopPropagation()} // 클릭 이벤트 전파 방지
                >
                    {/* 그룹 멤버 보기 */}
                    <button
                        onClick={() => handleViewTeamMembers(teamContextMenu.teamId)} // 팀 멤버 보기 연결
                        className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                    >
                        그룹 멤버
                    </button>
                    <button
                        onClick={() => handleLeaveTeamClick(teamContextMenu.teamId)} // 재확인 모달 표시
                        className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                    >
                        그룹 탈퇴
                    </button>
                    <button
                        onClick={() => {
                            setAddFriendInTeamModalVisible(true); // 멤버 추가 모달 표시
                            setSelectedTeamId(teamContextMenu.teamId); // 현재 팀 ID 저장
                        }}
                        className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                    >
                        멤버 추가
                    </button>

                </div>
            )}


            {/* 그룹 생성 모달 */}
            {createTeamModalVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded p-6 shadow-lg w-1/2">
                        <h2 className="text-lg font-bold mb-4">그룹 생성</h2>
                        <input
                            type="text"
                            placeholder="그룹 이름 입력 (최대 10자)"
                            maxLength={10}
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <div className="mb-4">
                            <h3 className="text-md font-semibold mb-2">선택된 친구</h3>
                            <div className="flex gap-2 flex-wrap">
                                {selectedFriends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="bg-blue-500 text-white px-4 py-1 rounded"
                                    >
                                        {friend.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold mb-2">내 친구 목록</h3>
                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        onClick={() => handleSelectFriend(friend)}
                                        className={`p-2 border rounded cursor-pointer ${
                                            selectedFriends.find((f) => f.id === friend.id)
                                                ? 'bg-blue-100'
                                                : ''
                                        }`}
                                    >
                                        {friend.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-4">
                            <button
                                onClick={() => {
                                    setCreateTeamModalVisible(false);
                                    setSelectedFriends([]);
                                    setNewTeamName('');
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateTeam}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 멤버 추가 모달 */}
            {addFriendInTeamModalVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded p-6 shadow-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">팀 멤버 추가</h2>
                        <input
                            type="email"
                            placeholder="친구 이메일 입력"
                            value={friendEmail}
                            onChange={(e) => setFriendEmail(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setAddFriendInTeamModalVisible(false);
                                    setFriendEmail('');
                                    setSelectedTeamId(null); // 선택된 팀 ID 초기화
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    if (!selectedTeamId) {
                                        console.error('Selected team ID is null or undefined');
                                        return;
                                    }
                                    handleAddFriendInTeam(selectedTeamId, friendEmail);
                                    setAddFriendInTeamModalVisible(false);
                                    setFriendEmail('');
                                    setSelectedTeamId(null); // 선택된 팀 ID 초기화
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {teamMembersContext.visible && (
                <div
                    className="absolute bg-white shadow-lg rounded p-6 z-50"
                    style={{
                        top: teamMembersContext.y,
                        left: teamMembersContext.x,
                        width: '500px', // 너비 확장
                        maxHeight: '600px', // 최대 높이 600px
                        overflowY: teamMembersContext.members.length > 10 ? 'auto' : 'visible', // 스크롤 조건부 적용
                    }}
                    onClick={(e) => e.stopPropagation()} // 클릭 이벤트 전파 방지
                >
                    <h3 className="text-lg font-semibold mb-4">팀 멤버</h3>
                    <div
                        style={{
                            maxHeight: '540px', // 제목, 버튼 제외 영역 최대 높이
                            overflowY: 'auto', // 스크롤 가능한 영역 설정
                        }}
                    >
                        {teamMembersContext.members.length > 0 ? (
                            teamMembersContext.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="p-3 border-b last:border-0 flex justify-between items-center"
                                >
                                    <span className="text-base">{member.name}</span>
                                    <span className="text-gray-500 text-sm">({member.email})</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-base">멤버가 없습니다.</p>
                        )}
                    </div>
                    <button
                        onClick={() =>
                            setTeamMembersContext({
                                visible: false,
                                members: [],
                                teamId: null,
                                x: 0,
                                y: 0,
                            })
                        }
                        className="mt-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full"
                    >
                        닫기
                    </button>
                </div>
            )}
        </div>
    );

    const handleContextMenu = (e, teamId) => {
        e.preventDefault();

        const targetElement = e.currentTarget;
        if (!targetElement) {
            console.error('Target element not found for context menu');
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const x = Math.min(rect.right + 8, window.innerWidth - 200); // 메뉴가 화면 밖으로 나가지 않도록 제한
        const y = Math.min(rect.top, window.innerHeight - 100); // 상단 위치도 제한

        setTeamContextMenu({
            x,
            y,
            teamId,
        });
    };

    const handleViewTeamMembers = async (teamId) => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");

            const response = await axios.get('http://localhost:8080/team/friends', {
                params: { teamId },
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setTeamContextMenu(null); // 팀 컨텍스트 메뉴 닫기
            setTeamMembersContext({
                visible: true,
                members: response.data || [],
                teamId: teamId,
                x: teamContextMenu.x, // 기존 팀 컨텍스트 메뉴의 X 좌표 사용
                y: teamContextMenu.y, // 기존 팀 컨텍스트 메뉴의 Y 좌표 사용
            });
        } catch (error) {
            console.error('Error fetching team members:', error);

            setTeamContextMenu(null); // 팀 컨텍스트 메뉴 닫기
            setTeamMembersContext({
                visible: true,
                members: [],
                teamId: teamId,
                x: teamContextMenu.x,
                y: teamContextMenu.y,
            });
        }
    };

    // 팀 탈퇴 클릭 핸들러 (모달 표시)
    const handleLeaveTeamClick = (teamId) => {
        setLeaveConfirmModal({
            visible: true,
            teamId: teamId,
        });

        setTeamContextMenu(null); // 컨텍스트 메뉴 닫기
    };

    // 팀 탈퇴 확인 핸들러
    const handleConfirmLeaveTeam = async () => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        try {
            const { teamId } = leaveConfirmModal; // 탈퇴할 팀 ID 가져오기
            const response = await axios.delete('http://localhost:8080/team', {
                headers: {Authorization: `Bearer ${accessToken}`}, params: {teamId},
            });
            if (response.data) {
                alert('그룹에서 탈퇴했습니다.');
                setTeams((prev) => prev.filter((team) => team.id !== teamId)); // 탈퇴한 팀 제거
            } else {
                alert('탈퇴에 실패했습니다.');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
            console.error(error);
        } finally {
            setLeaveConfirmModal({ visible: false, teamId: null }); // 모달 닫기
        }
    };

    // 팀 탈퇴 취소 핸들러
    const handleCancelLeaveTeam = () => {
        setLeaveConfirmModal({ visible: false, teamId: null });
    };

    // 멤버 추가
    const handleAddFriendInTeam = async (teamId, friendEmail) => {
        try {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            if (!accessToken) throw new Error('Access token is missing.');

            const response = await axios.post('http://localhost:8080/team/friend', {
                teamId,
                friendEmail,
            }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.data) {
                alert(`${response.data.name} (${response.data.email})님에게 팀 합류 요청을 보냈습니다.`);
            }
        } catch (error) {
            console.error('Error adding friend to team:', error);
            alert('친구 추가에 실패했습니다.');
        }
    };


    // API 호출: 팀 생성
    const handleCreateTeam = async () => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        if (!newTeamName.trim()) {
            alert('그룹 이름을 입력하세요.');
            return;
        }

        try {
            const createDto = {
                friends: selectedFriends.map((friend) => friend.id),
                name: newTeamName.trim(),
            };

            const response = await axios.post('http://localhost:8080/team',
                createDto,
                {headers: {Authorization: `Bearer ${accessToken}`}});

            if (response.data) {
                alert('그룹이 성공적으로 생성되었습니다!');
                setTeams((prev) => [...prev, { id: Date.now(), name: newTeamName }]); // 임시 ID로 추가
                setCreateTeamModalVisible(false); // 모달 닫기
                setSelectedFriends([]);
                setNewTeamName('');
                await fetchTeamRequests();
                await fetchTeams();
            }
        } catch (error) {
            alert('그룹 생성 중 오류가 발생했습니다.');
            console.error(error);
        }
    };

    // 친구 선택 핸들러
    const handleSelectFriend = (friend) => {
        setSelectedFriends((prev) => {
            if (prev.find((f) => f.id === friend.id)) {
                return prev.filter((f) => f.id !== friend.id); // 이미 선택된 경우 제거
            } else {
                return [...prev, friend]; // 선택되지 않은 경우 추가
            }
        });
    };

    // 알림 가져오기 API 호출
    async function fetchNotifications(page) {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        try {
            const response = await fetch(`http://localhost:8080/notifications?page=${page}&size=10`, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications((prev) => (page === 0 ? data : [...prev, ...data]));
                setHasMore(data.length === 10); // 데이터가 10개면 추가 페이지 가능
                setCurrentPage(page);
            } else {
                console.error("Failed to fetch notifications");
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }

    // 클릭 시 컨텍스트 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // 클릭 시 컨텍스트 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = () => setFriendContextMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // 클릭 시 컨텍스트 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = () => setTeamContextMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // 클릭 시 컨텍스트 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = () =>
            setTeamMembersContext({
                visible: false,
                members: [],
                teamId: null,
                x: 0,
                y: 0,
            }); // 안전한 초기 상태로 리셋
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isNotificationOpen) {
            fetchNotifications(0); // 알림 창 열릴 때 첫 페이지 데이터 로드
        }
    }, [isNotificationOpen]);

    useEffect(() => {
        // SSE 연결 설정
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        if (!accessToken) {
            console.error("Access token is missing.");
            return;
        }

        const source = new EventSource(
            `http://localhost:8080/notification/subscribe?token=${accessToken}`
        );

        // 알림 수신 처리
        source.onmessage = (event) => {
            console.log("New Notification:", event.data);

            // 새로운 알림 데이터를 상태에 추가
            const newNotification = JSON.parse(event.data);
            setNotifications((prevNotifications) => [
                newNotification,
                ...prevNotifications,
            ]);
        };

        // SSE 연결 종료 처리
        source.onclose = () => {
            console.log("SSE connection closed.");
        };

        // SSE 오류 처리
        source.onerror = (error) => {
            console.error("SSE connection error:", error);
            source.close();
        };

        setEventSource(source); // SSE 객체 저장

        // 컴포넌트 언마운트 시 SSE 연결 닫기
        return () => {
            source.close();
        };
    }, []);

    if (loading) return <div>Loading...</div>;

    if (error) return <div className="text-red-500">{error}</div>;

    return (<div className="h-screen flex flex-col bg-gray-100">
        <div className="flex flex-grow">
            {/* 왼쪽 바 */}
            <div className="w-1/5 bg-white shadow-md flex flex-col items-start p-4 gap-6">
                {/* 사용자 정보 */}
                <div className="mt-12 mb-3">
                    <h2 className="text-2xl font-bold text-gray-800">{userInfo.name}</h2>
                    <p className="text-lg text-gray-600">{userInfo.email}</p>
                </div>

                {/* 종모양 알림 아이콘 */}
                <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    title="알림"
                >
                    <FaBell size={24} />
                </button>

                <hr className="w-full border-gray-300 my-4"/>

                {/* 버튼 그룹 */}
                <div className="flex w-full">
                    {/* TODAY LIST 버튼 */}
                    <button
                        onClick={() => setActiveTab('today')}
                        className={`w-1/2 px-4 py-2 rounded-l ${activeTab === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-400`}
                    >
                        TODAY LIST
                    </button>

                    {/* Community 버튼 */}
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`w-1/2 px-4 py-2 rounded-r ${activeTab === 'community' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-400`}
                    >
                        Community
                    </button>
                </div>
                <hr className="w-full border-gray-300 my-4"/>

                {/* 조건부 콘텐츠 렌더링 */}
                <div className="w-full">
                    {activeTab === 'today' ? (<>
                        <h3 className="text-xl font-semibold mb-4">TODAY LIST</h3>
                        <div className="bg-gray-200 rounded p-4 max-h-96 overflow-y-auto">
                            {todayTasks.length === 0 ? (<p className="text-sm text-gray-500">오늘의 일정이
                                없습니다.</p>) : (todayTasks.map((task) => (<div
                                key={task.id}
                                className="mb-6 px-4 py-2 rounded shadow"
                                style={{
                                    backgroundColor: task.categoryColor, color: 'white',
                                }}
                            >
                                <p className="text-sm font-bold">{task.description}</p>
                                <p className="text-xs">{`${task.start} - ${task.end}`}</p>
                            </div>)))}
                        </div>
                    </>) : (<>
                        <h3 className="text-xl font-semibold mb-4">COMMUNITY</h3>
                        {/* 친구 목록 */}
                        <div className="relative bg-gray-200 rounded p-4 mb-4 max-h-48 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4"> {/* 제목과 리스트 사이 여백 조정 */}
                                <h4 className="text-lg font-bold">친구 목록</h4>
                                {/* Friends Manage 버튼 */}
                                <button
                                    onClick={() => setActiveView('friends')}
                                    className="text-gray-500 hover:text-blue-500 focus:outline-none"
                                    aria-label="Manage Friends"
                                >
                                    <i className="fas fa-cog"></i>
                                </button>
                            </div>
                            {friends.length === 0 ? (
                                <p className="text-sm text-gray-500">친구가 없습니다.</p>) : (friends.map((friend) => (<div
                                key={friend.id}
                                className="mb-3 px-4 py-2 rounded shadow bg-blue-100"
                            >
                                <p className="text-sm font-bold">{friend.name}</p>
                                <p className="text-xs">{friend.email}</p>
                            </div>)))}
                        </div>
                        {/* 팀 목록 */}
                        <div className="relative bg-gray-200 rounded p-4 max-h-48 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4"> {/* 제목과 리스트 사이 여백 조정 */}
                                <h4 className="text-lg font-bold">팀 목록</h4>
                                {/* Teams Manage 버튼 */}
                                <button
                                    onClick={() => setActiveView('teams')}
                                    className="text-gray-500 hover:text-blue-500 focus:outline-none"
                                    aria-label="Manage Teams"
                                >
                                    <i className="fas fa-cog"></i>
                                </button>
                            </div>
                            {teams.length === 0 ? (
                                <p className="text-sm text-gray-500">가입된 팀이 없습니다.</p>) : (teams.map((team) => (<div
                                key={team.teamId}
                                className="mb-3 px-4 py-2 rounded shadow bg-green-100"
                            >
                                <p className="text-sm font-bold">{team.name}</p>
                            </div>)))}
                        </div>
                    </>)}
                </div>
            </div>

            {/* 캘린더 */}
            <div className="w-4/5 flex flex-col">
                {activeView === 'calendar' && (<Calendar
                    localizer={localizer}
                    events={events}
                    selectable
                    onSelectSlot={(slotInfo) => {
                        setSelectedDate(slotInfo.start);
                        setModalOpen(true);
                    }}
                    components={{
                        event: ({event}) => (<div
                            onContextMenu={(e) => handleRightClick(e, event)}
                            style={{
                                backgroundColor: event.backgroundColor,
                                color: 'white',
                                padding: '5px',
                                borderRadius: '5px',
                            }}
                        >
                            {event.title}
                        </div>),
                    }}
                    style={{height: 600}}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.backgroundColor, // 카테고리 색상 적용
                            color: 'white', // 글자 색상
                            borderRadius: '5px', // 약간의 둥근 모서리
                            padding: '5px', border: 'none',
                        },
                    })}
                />)}
                {activeView === 'friends' && renderFriendsManage()}
                {activeView === 'teams' && renderTeamsManage()}
            </div>
        </div>

        {/* 컨텍스트 메뉴 */}
        {contextMenu && (<div
            className="context-menu"
            style={{
                position: 'absolute',
                top: contextMenu.mouseY,
                left: contextMenu.mouseX,
                backgroundColor: 'white',
                border: '1px solid gray',
                borderRadius: '5px',
                zIndex: 1000,
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
        >
            <button
                onClick={() => {
                    handleDeleteTask(); // 삭제 핸들러 실행
                    setContextMenu(null); // 메뉴 닫기
                }}
                className="block px-4 py-2 hover:bg-gray-200"
            >
                삭제
            </button>
            <button
                onClick={() => {
                    handleEditTask(); // 수정 핸들러 실행
                    setContextMenu(null); // 메뉴 닫기
                }}
                className="block px-4 py-2 hover:bg-gray-200"
            >
                수정
            </button>
        </div>)}

        {/* 수정 모달 */}
        {editModalOpen && (
            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow-lg">
                    <h2 className="text-lg font-bold mb-4">일정 수정</h2>
                    <div className="flex flex-col gap-2">
                        {/* 일정 설명 */}
                        <input
                            type="text"
                            name="description"
                            placeholder="일정 설명"
                            value={editTask.description || ''}
                            onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                            className="border rounded p-2"
                        />

                        {/* 일정 날짜 */}
                        <input
                            type="date"
                            name="date"
                            value={editTask.date || ''}
                            onChange={(e) => setEditTask({...editTask, date: e.target.value})}
                            className="border rounded p-2"
                        />

                        {/* 시작 시간 */}
                        <input
                            type="time"
                            name="startTime"
                            value={editTask.startTime || ''}
                            onChange={(e) => setEditTask({...editTask, startTime: e.target.value})}
                            className="border rounded p-2"
                        />

                        {/* 종료 시간 */}
                        <input
                            type="time"
                            name="endTime"
                            value={editTask.endTime || ''}
                            onChange={(e) => setEditTask({...editTask, endTime: e.target.value})}
                            className="border rounded p-2"
                        />

                        {/* 카테고리 선택 */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setEditTask({
                                        ...editTask,
                                        categoryDropdownOpen: !editTask.categoryDropdownOpen, // 드롭다운 토글
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
                                                    categoryId: category.categoryId, // 선택된 카테고리 ID 업데이트
                                                    categoryDropdownOpen: false, // 드롭다운 닫기
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
                            onClick={() => setEditModalOpen(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleEditSubmit}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>)}

        {/* 알림 창 */}
        {isNotificationOpen && (
            <div
                className="absolute top-0 bg-white shadow-md p-4 h-full overflow-y-auto z-50"
                style={{
                    left: "20%", // 왼쪽 탭의 오른쪽에 고정 (w-1/5의 너비에 맞춤)
                    width: "25%", // 알림 창 너비 설정
                }}
            >
                <h3 className="text-xl font-bold mb-4">알림</h3>
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="p-2 mb-2 border-b border-gray-300 last:border-0"
                        >
                            <p className="font-semibold text-blue-500">
                                {notification.notificationType}
                            </p>
                            <p>{notification.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">새 알림이 없습니다.</p>
                )}
            </div>
        )}


        {/* 일정 생성 모달 */}
        {modalOpen && (<div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-lg font-bold mb-4">새 일정 추가</h2>
                <div className="flex flex-col gap-2">
                    {/* 일정 설명 입력 */}
                    <input
                        type="text"
                        name="description"
                        placeholder="일정 설명"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        className="border rounded p-2"
                    />

                    {/* 시작 시간 입력 */}
                    <input
                        type="time"
                        name="startTime"
                        value={newTask.startTime}
                        onChange={(e) => setNewTask({...newTask, startTime: e.target.value})}
                        className="border rounded p-2"
                    />

                    {/* 종료 시간 입력 */}
                    <input
                        type="time"
                        name="endTime"
                        value={newTask.endTime}
                        onChange={(e) => setNewTask({...newTask, endTime: e.target.value})}
                        className="border rounded p-2"
                    />

                    {/* 카테고리 선택 */}
                    <div className="relative">
                        <button
                            onClick={() => setNewTask({
                                ...newTask, categoryDropdownOpen: !newTask.categoryDropdownOpen, // 드롭다운 토글
                            })}
                            className="border rounded p-2 w-full text-left flex justify-between items-center"
                        >
                            {categories.find((cat) => cat.categoryId === newTask.categoryId) ? (
                                <span className="flex items-center gap-2">
                <span
                    style={{
                        backgroundColor: categories.find((cat) => cat.categoryId === newTask.categoryId)?.color,
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        display: 'inline-block',
                    }}
                ></span>
                                    {categories.find((cat) => cat.categoryId === newTask.categoryId)?.name}
            </span>) : ('카테고리를 선택하세요')}
                            <span className="ml-2">{newTask.categoryDropdownOpen ? '▲' : '▼'}</span>
                        </button>
                        {newTask.categoryDropdownOpen && (
                            <ul className="absolute border rounded mt-1 bg-white shadow-lg w-full max-h-40 overflow-auto z-10">
                                {categories.map((category) => (<li
                                    key={category.categoryId}
                                    onClick={() => setNewTask({
                                        ...newTask, categoryId: category.categoryId, // 선택된 카테고리 ID 설정
                                        categoryDropdownOpen: false, // 드롭다운 닫기
                                    })}
                                    className={`flex items-center gap-2 p-2 cursor-pointer ${newTask.categoryId === category.categoryId ? 'bg-gray-200' : ''}`}
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
                                </li>))}
                            </ul>)}
                    </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => setCategoryModalOpen(true)} // 카테고리 관리 모달 열기
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        카테고리 관리
                    </button>
                    <button
                        onClick={handleTaskSubmit}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        추가
                    </button>
                </div>
            </div>
        </div>)}

        {/* 카테고리 관리 모달 */}
        {categoryModalOpen && (
            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-96">
                    <h2 className="text-lg font-bold mb-4">카테고리 관리</h2>
                    <ul className="flex flex-col gap-2">
                        {categories.map((category) => (
                            <li
                                key={category.categoryId}
                                className="flex items-center justify-between bg-gray-200 p-2 rounded"
                            >
                                <div className="flex items-center gap-2">
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
                                </div>
                                <div className="flex gap-2">
                                    {/* 수정 버튼 */}
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                                        disabled={category.name === '기본'}
                                        style={{
                                            opacity: category.name === '기본' ? 0.5 : 1,
                                            cursor: category.name === '기본' ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        수정
                                    </button>
                                    {/* 삭제 버튼 */}
                                    <button
                                        onClick={() => handleDeleteCategory(category.categoryId)}
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                        disabled={category.name === '기본'} // 기본 카테고리는 삭제 비활성화
                                        style={{
                                            opacity: category.name === '기본' ? 0.5 : 1,
                                            cursor: category.name === '기본' ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* 카테고리 추가/수정 섹션 */}
                    <div className="mt-4">
                        <h3 className="text-md font-semibold mb-2">
                            {categoryEditMode ? '카테고리 수정' : '새 카테고리 추가'}
                        </h3>
                        <input
                            type="text"
                            name="name"
                            placeholder="카테고리 이름"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                            className="border rounded p-2 mb-2 w-full"
                        />
                        <select
                            name="color"
                            value={newCategory.color}
                            onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                            className="border rounded p-2 mb-2 w-full"
                        >
                            <option value="" disabled>
                                색상을 선택하세요
                            </option>
                            <option value="RED">빨강</option>
                            <option value="GREEN">초록</option>
                            <option value="BLUE">파랑</option>
                            <option value="YELLOW">노랑</option>
                            <option value="SKYBLUE">하늘색</option>
                            <option value="GREY">회색</option>
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCategorySubmit}
                                className={`px-4 py-2 ${
                                    categoryEditMode ? 'bg-yellow-500' : 'bg-green-500'
                                } text-white rounded`}
                            >
                                {categoryEditMode ? '수정' : '추가'}
                            </button>
                            {categoryEditMode && (
                                <button
                                    onClick={() => {
                                        setCategoryEditMode(false);
                                        setNewCategory({name: '', color: ''});
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded"
                                >
                                    취소
                                </button>
                            )}
                        </div>
                    </div>
                    {/* 닫기 버튼 */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setCategoryModalOpen(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>);
}
