import React, { useEffect, useState, useRef } from "react";
import {
    getNotifications,
    markNotificationAsRead,
    subscribeToNotifications,
} from "../api/notificationApi";
import {useAlert} from "../root/AlertProvider";

const NotificationModal = ({ isOpen, onClose, sidebarRef }) => {
    const { addAlert } = useAlert();
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const scrollRef = useRef(null);

    // 알림 가져오기
    const fetchNotifications = async (page) => {
        try {
            const data = await getNotifications(page, 15); // 페이지당 15개씩 가져옴
            setNotifications((prev) => (page === 0 ? data : [...prev, ...data]));
            setHasMore(data.length === 15); // 더 많은 알림이 있는지 확인
            setCurrentPage(page);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            addAlert("알림 데이터 로드 중 오류가 발생했습니다, 잠시 후 다시 시도해주세요.")
        }
    };

    // 알림 읽음 처리
    const markAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
            addAlert("알림 읽기 처리 중 오류가 발생했습니다, 잠시 후 다시 시도해주세요.")
        }
    };

    // 모두 읽음 처리
    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter((n) => !n.isRead);
        try {
            await Promise.all(
                unreadNotifications.map((notification) =>
                    markNotificationAsRead(notification.id)
                )
            );
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, isRead: true }))
            );
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            addAlert("알림 읽기 처리 중 오류가 발생했습니다, 잠시 후 다시 시도해주세요.")
        }
    };

    // 모달 위치 동적 계산
    useEffect(() => {
        if (isOpen && sidebarRef?.current) {
            const rect = sidebarRef.current.getBoundingClientRect();
            setModalPosition({
                top: rect.top,
                left: rect.right,
            });
        }
    }, [isOpen, sidebarRef]);

    // SSE 연결 설정
    useEffect(() => {
        if (!isOpen) return;

        fetchNotifications(0);

        const source = subscribeToNotifications((newNotification) => {
            if (newNotification && newNotification.id && newNotification.content) {
                setNotifications((prev) => [newNotification, ...prev]);
            } else {
                console.error("Invalid notification data:", newNotification);
            }
        });

        return () => source.close();
    }, [isOpen]);

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
        if (!scrollRef.current || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        if (scrollHeight - scrollTop - clientHeight <= 5) {
            fetchNotifications(currentPage + 1);
        }
    };

    // 스크롤 이벤트 리스너 등록
    useEffect(() => {
        const current = scrollRef.current;
        if (current) {
            current.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (current) {
                current.removeEventListener("scroll", handleScroll);
            }
        };
    }, [hasMore, currentPage]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed bg-white shadow-lg border rounded-lg"
            style={{
                top: modalPosition.top,
                left: modalPosition.left + "px",
                zIndex: 1050,
                width: "320px",
                height: "100%",
            }}
        >
            <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-semibold">알림</h2>
                <button
                    className="text-blue-500 hover:underline"
                    onClick={markAllAsRead}
                >
                    모두 읽기
                </button>
                <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={onClose}
                >
                    닫기
                </button>
            </div>
            <div
                ref={scrollRef}
                className="p-4 overflow-y-auto h-[calc(100%-4rem)]"
            >
                {notifications.length > 0 ? (
                    <ul className="space-y-2">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`p-3 rounded shadow hover:bg-gray-200 cursor-pointer ${
                                    notification.isRead
                                        ? "bg-gray-300 text-gray-700"
                                        : "bg-gray-100 text-black"
                                }`}
                            >
                                <p className="text-xs text-gray-500 mb-1">
                                    {notification.notificationType || "알림"}
                                </p>
                                <p>{notification.content || "내용 없음"}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">알림이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationModal;
