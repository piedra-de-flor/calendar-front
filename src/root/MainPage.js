import React, {useEffect, useState} from 'react';
import './MainPage.css';
import LeftSidebar from '../leftSidebar/LeftSidebar';
import CalendarView from '../rightContent/CalendarView';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FriendsManagement from "../rightContent/FriendsManagement";
import TeamsManagement from "../rightContent/TeamsManagement";

const MainPage = () => {
    const [activeRightTab, setActiveRightTab] = useState('calendar'); // 기본: 캘린더
    const [todayTasksTrigger, setTodayTasksTrigger] = useState(0);
    const [teamListTrigger, setTeamListTrigger] = useState(0);
    const [friendListTrigger, setFriendListTrigger] = useState(0);
    const [highlightedSlots, setHighlightedSlots] = useState([]);
    const [slotsToHighlight, setSlotsToHighlight] = useState([]);
    const [triggerHighlight, setTriggerHighlight] = useState(false); // 강조 상태 제어

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    if (!accessToken) throw new Error('Access token is missing.');

    // "캘린더에서 보기" 클릭 시 동작
    const handleViewInCalendar = (slots) => {
        setHighlightedSlots(slots); // 강조할 슬롯 설정
        setActiveRightTab('calendar'); // 탭을 캘린더로 전환
        setTriggerHighlight(true); // 강조 트리거 활성화
    };

    // 탭 전환 시 강조 상태 초기화
    useEffect(() => {
        if (activeRightTab === 'calendar' && triggerHighlight) {
            setSlotsToHighlight(highlightedSlots); // 강조할 슬롯 설정
            setHighlightedSlots([]); // `highlightedSlots` 초기화
            setTriggerHighlight(false); // 트리거 비활성화
        } else if (activeRightTab !== 'calendar') {
            setSlotsToHighlight([]); // 다른 탭으로 이동 시 슬롯 초기화
        }
    }, [activeRightTab, highlightedSlots, triggerHighlight]);

    const refreshTodayTasks = () => {
        setTodayTasksTrigger((prev) => prev + 1);
    };

    const refreshTeamList = () => {
        setTeamListTrigger((prev) => prev + 1);
    };

    const refreshFriendList = () => {
        setFriendListTrigger((prev) => prev + 1);
    };

    const renderRightTab = () => {
        if (activeRightTab === 'friends') {
            return (
                <FriendsManagement
                    onBackToCalendar={() => setActiveRightTab('calendar')}
                    refreshFriendList={refreshFriendList}
                />
            );
        }
        if (activeRightTab === 'teams') {
            return (
                <TeamsManagement
                    onBackToCalendar={() => setActiveRightTab('calendar')}
                    refreshTeamList={refreshTeamList}
                />
            );
        }
        if (activeRightTab === 'calendar') {
            return <CalendarView
                refreshTodayTasks={refreshTodayTasks}
                highlightedSlots={slotsToHighlight}
            />;
        }
    };


    return (
        <div className="main-page">
            {/* 왼쪽 사이드바 */}
            <div className="left-section">
                <LeftSidebar refreshTrigger={todayTasksTrigger}
                             refreshFriendListTrigger={refreshFriendList}
                             refreshTeamListTrigger={refreshTeamList}
                             onManageFriends={() => setActiveRightTab('friends')}
                             onManageTeams={() => setActiveRightTab('teams')}
                             setHighlightedSlots={handleViewInCalendar} // 상태 전달
                />
            </div>

            {/* 오른쪽 컨텐츠 영역 */}
            <div className="right-section">
                <div className="right-section flex-grow">{renderRightTab()}</div>
            </div>
        </div>
    );
};

export default MainPage;
