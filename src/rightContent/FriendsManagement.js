import React, {useEffect, useRef, useState} from 'react';
import {
    deleteFriend,
    fetchFriends,
    fetchReceivedRequests,
    fetchSentRequests,
    sendFriendRequest,
} from "../api/FriendApi";

import {acceptRequest, cancelRequest, rejectRequest,} from "../api/InvitationApi";
import {useAlert} from "../root/AlertProvider";


const FriendsManagement = ({ onBackToCalendar, refreshFriendList }) => {
    const isFetching = useRef(false);
    const { addAlert } = useAlert();
    const [friends, setFriends] = useState([]);
    const [sentFriendRequests, setSentFriendRequests] = useState([]);
    const [receivedFriendRequests, setReceivedFriendRequests] = useState([]);
    const [newFriendEmail, setNewFriendEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ visible: false, friendId: null });
    const [friendContextMenu, setFriendContextMenu] = useState(null);

    const fetchFriendsData = async () => {
        if (isFetching.current) return; // 이미 요청 중이면 실행하지 않음
        try {
            setLoading(true);
            const [friendsResponse, sentResponse, receivedResponse] = await Promise.all([
                fetchFriends(),
                fetchSentRequests(),
                fetchReceivedRequests(),
            ]);

            setFriends(friendsResponse.data);
            setSentFriendRequests(sentResponse.data);
            setReceivedFriendRequests(receivedResponse.data);
        } catch (error) {
            console.error('Error fetching friends data:', error);
            addAlert("친구 데이터 로드 실패, 잠시 후 다시 시도해주세요.")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendsData();

        const handleClickOutside = () => {
            setFriendContextMenu(null); // 클릭 시 컨텍스트 메뉴 닫기
        };

        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleFriendRightClick = (e, friendId) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();

        // 요소의 오른쪽과 상단에 정확히 붙도록 위치 설정
        setFriendContextMenu({
            mouseX: rect.right + 4, // 요소의 오른쪽 끝
            mouseY: rect.top,   // 요소의 상단
            friendId,
        });
    };

    // ** 새로운 친구 추가 요청 **
    const handleAddFriend = async () => {
        try {
            await sendFriendRequest(newFriendEmail);
            addAlert("친구 요청 성공.")
            setNewFriendEmail("");
            fetchFriendsData();
        } catch (error) {
            console.error("Error sending friend request:", error);
            addAlert("친구 요청 실패, 잠시 후 다시 시도해주세요.")
        }
    };

    // ** 친구 삭제 **
    const handleDeleteFriend = async () => {
        try {
            if (!deleteConfirmModal.friendId) {
                console.error("Invalid friendId:", deleteConfirmModal.friendId);
                return;
            }

            await deleteFriend(deleteConfirmModal.friendId);
            setFriends(friends.filter((friend) => friend.id !== deleteConfirmModal.friendId));
            setDeleteConfirmModal({ visible: false, friendId: null });
            setFriendContextMenu(null);
            refreshFriendList();
        } catch (error) {
            console.error("Error deleting friend:", error);
            addAlert("친구 삭제 실패, 잠시 후 다시 시도해주세요.")
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await acceptRequest(requestId);
            await fetchFriendsData();
            refreshFriendList();
        } catch (error) {
            console.error("Error accepting request:", error);
            addAlert("친구 요청 수락 실패, 잠시 후 다시 시도해주세요.")
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await rejectRequest(requestId);
            await fetchFriendsData();
        } catch (error) {
            console.error("Error rejecting request:", error);
            addAlert("친구 요청 거절 실패, 잠시 후 다시 시도해주세요.")
        }
    };

    const handleCancelRequest = async (requestId) => {
        try {
            await cancelRequest(requestId);
            await fetchFriendsData();
        } catch (error) {
            console.error("Error cancel request:", error);
            addAlert("친구 요청 취소 실패, 잠시 후 다시 시도해주세요.")
        }
    };


    if (loading) {
        return <div className="text-center text-gray-600">Loading Friends Management...</div>;
    }

    return (
        <div className="relative flex gap-8 p-6">
            {/* 캘린더로 돌아가기 버튼 */}
            <div className="absolute top-2 left-6 mt-4">
                <button
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                    onClick={onBackToCalendar}
                >
                    ← 캘린더로 돌아가기
                </button>
            </div>

            {/* 왼쪽: 친구 관리 */}
            <div className="flex flex-col w-1/3 bg-gray-100 rounded p-4 shadow space-y-6 mt-16">
                <h2 className="text-xl font-bold text-gray-800 mb-4">친구 관리</h2>
                {friends.length > 0 ? (
                    <ul className="space-y-3 max-h-[400px] overflow-y-auto">
                        {friends.map((friend) => (
                            <li
                                key={friend.id}
                                className="bg-white p-4 rounded shadow flex justify-between items-center hover:shadow-md"
                                onContextMenu={(e) => handleFriendRightClick(e, friend.id)}>
                                <div>
                                    <p className="text-lg font-semibold text-gray-700">{friend.name}</p>
                                    <p className="text-sm text-gray-500">{friend.email}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">친구가 없습니다.</p>
                )}
            </div>

            {/* 오른쪽: 친구 추가 및 친구 요청 */}
            <div className="flex flex-col w-2/3 gap-6 mt-16">
                {/* 친구 추가 섹션 */}
                <div className="bg-gray-100 rounded p-4 shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">친구 추가</h3>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="이메일을 입력하세요"
                            className="flex-grow border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={newFriendEmail}
                            onChange={(e) => setNewFriendEmail(e.target.value)}
                        />
                        <button
                            onClick={handleAddFriend}
                            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
                        >
                            추가
                        </button>
                    </div>
                </div>

                {/* 받은 친구 요청 섹션 */}
                <div className="bg-gray-100 rounded p-4 shadow max-h-[200px] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">받은 친구 요청</h3>
                    {receivedFriendRequests.length > 0 ? (
                        receivedFriendRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white p-3 rounded shadow flex justify-between items-center"
                            >
                                <span className="text-gray-700">{request.senderEmail}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptRequest(request.id)}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        수락
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(request.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">받은 요청이 없습니다.</p>
                    )}
                </div>

                {/* 보낸 친구 요청 섹션 */}
                <div className="bg-gray-100 rounded p-4 shadow max-h-[200px] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">보낸 친구 요청</h3>
                    {sentFriendRequests.length > 0 ? (
                        sentFriendRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white p-3 rounded shadow flex justify-between items-center"
                            >
                                <span className="text-gray-700">{request.receiverEmail}</span>
                                <button
                                    onClick={() => handleCancelRequest(request.id)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    취소
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">보낸 요청이 없습니다.</p>
                    )}
                </div>
            </div>

            {friendContextMenu && (
                <div
                    className="fixed bg-white shadow-lg rounded p-2"
                    style={{
                        top: `${friendContextMenu.mouseY}px`, // 요소의 상단
                        left: `${friendContextMenu.mouseX}px`, // 요소의 오른쪽 끝
                        zIndex: 50,
                    }}
                >
                    <button
                        onClick={() => setDeleteConfirmModal({
                            visible: true,
                            friendId: friendContextMenu.friendId,
                        })}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                    >
                        삭제
                    </button>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {deleteConfirmModal.visible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-1/3">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            정말 삭제하시겠습니까?
                        </h3>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() =>
                                    setDeleteConfirmModal({ visible: false, friendId: null })
                                }
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeleteFriend}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendsManagement;