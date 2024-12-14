// TeamCreateModal.js
import React from 'react';

const TeamCreateModal = ({
                             showCreateTeamModal,
                             setShowCreateTeamModal,
                             newTeamName,
                             setNewTeamName,
                             friends,
                             selectedFriends,
                             handleFriendSelect,
                             handleRemoveFriend,
                             handleAddTeam,
                         }) => {
    if (!showCreateTeamModal) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg px-10 py-8 shadow-2xl w-full max-w-5xl h-[80%] flex flex-col">
                <h3 className="text-3xl font-semibold text-gray-800 mb-8 text-center">팀 생성</h3>
                {/* 팀 이름 입력 */}
                <div className="mb-8">
                    <label className="block text-xl font-medium text-gray-700 mb-3">팀 이름</label>
                    <input
                        type="text"
                        placeholder="팀 이름을 입력하세요"
                        className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                    />
                </div>
                {/* 선택된 친구 */}
                <div className="mb-8">
                    <h4 className="text-xl font-medium text-gray-800 mb-3">선택된 친구</h4>
                    <div
                        className={`flex flex-wrap gap-4 ${
                            selectedFriends.length === 0
                                ? 'justify-center items-center bg-gray-100 p-6 rounded-lg border border-gray-300'
                                : ''
                        }`}
                    >
                        {selectedFriends.length > 0 ? (
                            selectedFriends.map((friend) => (
                                <div
                                    key={friend.id}
                                    className="flex items-center bg-blue-100 px-4 py-2 rounded-lg shadow-sm cursor-pointer"
                                    onClick={() => handleFriendSelect(friend)} // 선택된 친구도 클릭 시 해제
                                >
                                    <span className="text-blue-800 font-medium mr-2">{friend.name}</span>
                                    <span className="text-sm text-blue-500">{friend.email}</span>
                                    <button
                                        onClick={() => handleRemoveFriend(friend.id)}
                                        className="text-red-500 font-medium hover:text-red-700 ml-4"
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))
                        ) : (
                            <span className="text-gray-500 text-lg">선택된 친구가 없습니다.</span>
                        )}
                    </div>
                </div>
                {/* 친구 목록 */}
                <div className="flex-grow">
                    <h4 className="text-xl font-medium text-gray-800 mb-3">친구 목록</h4>
                    <div className="max-h-[300px] overflow-y-auto space-y-3">
                        {friends.map((friend) => {
                            const isSelected = selectedFriends.some((f) => f.id === friend.id);
                            return (
                                <div
                                    key={friend.id}
                                    className={`flex justify-between items-center p-3 rounded-lg shadow-sm cursor-pointer ${
                                        isSelected
                                            ? 'bg-gray-300 hover:bg-gray-400'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                    onClick={() => handleFriendSelect(friend)} // 친구 선택 및 해제
                                >
                                    <span className={`font-medium ${isSelected ? 'text-gray-700' : 'text-gray-800'}`}>
                                        {friend.name}
                                    </span>
                                    <span className="text-sm text-gray-500">{friend.email}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* 버튼 */}
                <div className="flex justify-end gap-6 mt-8">
                    <button
                        onClick={() => setShowCreateTeamModal(false)}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-lg"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleAddTeam}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg"
                    >
                        생성
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamCreateModal;
