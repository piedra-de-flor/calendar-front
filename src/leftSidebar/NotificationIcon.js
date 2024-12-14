import React from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationIcon = ({ unreadCount, onClick }) => {
    return (
        <button
            className="relative text-gray-600 hover:text-gray-800"
            onClick={onClick}
            title="알림"
        >
            <FaBell size={24} />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
                    {unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationIcon;
