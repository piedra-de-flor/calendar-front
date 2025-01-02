import React, {useState, useRef, useEffect} from 'react';
import '../root/MainPage.css';
import UserInfo from './UserInfo';
import TodayList from './TodayList';
import FriendTeamList from './FriendTeamList';
import NotificationIcon from './NotificationIcon';
import NotificationModal from '../modals/NotificationModal';

const LeftSidebar = ({ refreshTrigger, refreshFriendListTrigger, refreshTeamListTrigger, onManageFriends, onManageTeams, setHighlightedSlots }) => {
    const [activeTab, setActiveTab] = useState('today'); // 기본 탭
    const [isNotificationOpen, setIsNotificationOpen] = useState(false); // 알림 창 열림 상태
    const [unreadCount, setUnreadCount] = useState(0); // 읽지 않은 알림 수
    const sidebarRef = useRef(null); // Sidebar 위치 추적

    const handleTabChange = (tab) => setActiveTab(tab);

    return (
        <div className="left-section-contents relative" ref={sidebarRef}>
            {/* 알림 아이콘 */}
            <div className="notification flex-shrink-0 p-6 flex justify-between items-center relative">
                <span className="text-2xl font-extrabold text-gray-800">Calendar</span>
                <NotificationIcon
                    unreadCount={unreadCount}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                />
            </div>

            {/* Notification Modal */}
            <NotificationModal
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                sidebarRef={sidebarRef}
            />

            <hr className="w-full border-gray-300" />

            {/* 사용자 정보 */}
            <div className="user-info flex-shrink-0 p-6">
                <UserInfo/>
            </div>

            {/* 탭 버튼 */}
            <div className="tabs flex-shrink-0 flex w-full">
                <button
                    onClick={() => handleTabChange('today')}
                    className={`flex-1 px-4 py-2 rounded-l ${
                        activeTab === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    } hover:bg-blue-400`}
                >
                    Today
                </button>
                <button
                    onClick={() => handleTabChange('friends')}
                    className={`flex-1 px-4 py-2 rounded-r ${
                        activeTab === 'friends' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    } hover:bg-blue-400`}
                >
                    Friends & Teams
                </button>
            </div>

            <hr className="w-full border-gray-300" />

            {/* 활성화된 탭에 따른 렌더링 */}
            <div className="tab-content flex-grow w-full overflow-y-auto p-4 mt-10">
                {activeTab === 'today' && <TodayList refreshTrigger={refreshTrigger} />}
                {activeTab === 'friends' && (
                    <FriendTeamList
                        onManageFriends={onManageFriends}
                        onManageTeams={onManageTeams}
                        refreshFriendListTrigger={refreshFriendListTrigger}
                        refreshTeamListTrigger={refreshTeamListTrigger}
                        setHighlightedSlots={setHighlightedSlots} // 함수 전달
                    />
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
