import React, {useState} from 'react';
import './MainPage.css';
import LeftSidebar from '../leftSidebar/LeftSidebar';
import CalendarView from '../rightContent/CalendarView';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FriendsManagement from "../rightContent/FriendsManagement";
import TeamsManagement from "../rightContent/TeamsManagement";

const MainPage = () => {
    const [activeRightTab, setActiveRightTab] = useState('calendar'); // 기본: 캘린더

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    if (!accessToken) throw new Error('Access token is missing.');

    const renderRightTab = () => {
        if (activeRightTab === 'friends') {
            return (
                <FriendsManagement
                    accessToken={accessToken}
                    onBackToCalendar={() => setActiveRightTab('calendar')}
                />
            );
        }
        if (activeRightTab === 'teams') {
            return (
                <TeamsManagement
                    accessToken={accessToken}
                    onBackToCalendar={() => setActiveRightTab('calendar')}
                />
            );
        }
        if (activeRightTab === 'calendar') {
            return <CalendarView
                accessToken={accessToken}
            />;
        }
    };


    return (
        <div className="main-page">
            {/* 왼쪽 사이드바 */}
            <div className="left-section">
                <LeftSidebar accessToken={accessToken}
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
