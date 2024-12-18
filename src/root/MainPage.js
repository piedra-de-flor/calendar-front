import React, {useState} from 'react';
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

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    if (!accessToken) throw new Error('Access token is missing.');

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
