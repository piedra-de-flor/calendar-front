import React, {useState, useEffect, useRef} from 'react';
import {
    fetchTeams,
    createTeam,
    leaveTeam,
    fetchSentRequests,
    fetchReceivedRequests,
    sendTeamRequest,
    fetchTeamMembers,
} from '../api/TeamApi'; // teams.js에서 API 가져오기
import { fetchFriends } from '../api/FriendApi'; // friends.js에서 친구 API 가져오기
import TeamCreateModal from '../modals/TeamCreateModal';

const TeamsManagement = ({ onBackToCalendar }) => {
    const [teams, setTeams] = useState([]);
    const [friends, setFriends] = useState([]);
    const [sentTeamInvitations, setSentTeamInvitations] = useState([]);
    const [receivedTeamInvitations, setReceivedTeamInvitations] = useState([]);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    const [teamContextMenu, setTeamContextMenu] = useState(null); // 컨텍스트 메뉴 상태
    const [teamMembersContext, setTeamMembersContext] = useState({ visible: false, members: [] }); // 팀 멤버 메뉴 상태
    const [selectedTeam, setSelectedTeam] = useState(null); // 선택된 팀 상태
    const [leaveConfirmModal, setLeaveConfirmModal] = useState({ visible: false, teamId: null }); // 탈퇴 확인 모달 상태

    const teamMembersContextRef = useRef(null); // 팀 멤버 메뉴 ref

    // 데이터 가져오기
    const fetchTeamsData = async () => {
        try {
            setLoading(true);
            const [teamsData, sentRequests, receivedRequests, friendsData] = await Promise.all([
                fetchTeams(),
                fetchSentRequests(),
                fetchReceivedRequests(),
                (await fetchFriends()).data,
            ]);

            setTeams(teamsData);
            setSentTeamInvitations(sentRequests);
            setReceivedTeamInvitations(receivedRequests);
            setFriends(friendsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamsData();
    }, []);

    useEffect(() => {
        // 컨텍스트 메뉴 외부 클릭 시 닫기
        const handleClickOutside = () => {
            setTeamContextMenu(null);
        };

        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                teamMembersContextRef.current && // 메뉴가 렌더링된 상태에서
                !teamMembersContextRef.current.contains(e.target) // 클릭한 요소가 메뉴 내부가 아닐 때
            ) {
                setTeamMembersContext({ visible: false, members: [] }); // 팀 멤버 메뉴 닫기
            }
        };

        if (teamMembersContext.visible) {
            window.addEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [teamMembersContext.visible]);

    const handleFriendSelect = (friend) => {
        const isSelected = selectedFriends.some((f) => f.id === friend.id);
        if (isSelected) {
            setSelectedFriends((prev) => prev.filter((f) => f.id !== friend.id));
        } else {
            setSelectedFriends((prev) => [...prev, friend]);
        }
    };

    const handleRemoveFriend = (friendId) => {
        setSelectedFriends((prev) => prev.filter((f) => f.id !== friendId));
    };

    // 팀 생성 및 초대
    const handleAddTeam = async () => {
        try {
            const team = await createTeam(newTeamName);

            // 선택된 친구들에게 초대 전송
            const invitationPromises = selectedFriends.map((friend) =>
                sendTeamRequest(team.id, friend.id)
            );
            await Promise.all(invitationPromises);

            setNewTeamName('');
            setSelectedFriends([]);
            setShowCreateTeamModal(false);
            fetchTeamsData();
        } catch (error) {
            console.error('Error creating team or sending invitations:', error);
            alert('팀 생성 중 오류가 발생했습니다.');
        }
    };

    // 팀 요소 오른쪽 클릭 핸들러
    const handleTeamRightClick = (e, team) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setTeamContextMenu({
            mouseX: rect.right + 4, // 요소의 오른쪽
            mouseY: rect.top, // 요소의 상단
        });
        setSelectedTeam(team); // 선택된 팀 설정
    };

    // 탈퇴 확인 모달 열기
    const handleLeaveTeam = () => {
        if (selectedTeam) {
            setLeaveConfirmModal({ visible: true, teamId: selectedTeam.id });
        }
        setTeamContextMenu(null); // 컨텍스트 메뉴 닫기
    };

    // 탈퇴 확인 모달에서 탈퇴 확정
    const handleConfirmLeaveTeam = async () => {
        try {
            const { teamId } = leaveConfirmModal;
            await leaveTeam(teamId); // API 호출로 팀 탈퇴
            await fetchTeamsData(); // 팀 목록 새로고침
            await fetchSentRequests();
        } catch (error) {
            console.error('Error leaving team:', error);
        } finally {
            setLeaveConfirmModal({ visible: false, teamId: null }); // 모달 닫기
        }
    };

    const handleViewTeamMembers = async (teamId) => {
        try {
            const members = await fetchTeamMembers(teamId); // API 호출
            setTeamContextMenu(null); // 기존 컨텍스트 메뉴 닫기
            setTeamMembersContext({
                visible: true,
                members,
                teamId,
                x: teamContextMenu.mouseX, // 기존 X 좌표 사용
                y: teamContextMenu.mouseY, // 기존 Y 좌표 사용
            });
        } catch (error) {
            console.error('Error fetching team members:', error);
            setTeamContextMenu(null);
            setTeamMembersContext({
                visible: true,
                members: [],
                teamId,
                x: teamContextMenu.mouseX,
                y: teamContextMenu.mouseY,
            });
        }
    };

    if (loading) {
        return <div className="text-center text-gray-600">Loading Teams Management...</div>;
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

            {/* 왼쪽: 팀 목록 */}
            <div className="flex flex-col w-1/3 bg-gray-100 rounded p-6 shadow space-y-6 mt-16">
                <h2 className="text-xl font-bold text-gray-800 mb-4">팀 관리</h2>
                {teams.length > 0 ? (
                    <ul className="space-y-3 max-h-[400px] overflow-y-auto">
                        {teams.map((team) => (
                            <li
                                key={team.id}
                                className="bg-white p-4 rounded shadow flex justify-between items-center hover:shadow-md"
                                onContextMenu={(e) => handleTeamRightClick(e, team)}
                            >
                                <div>
                                    <p className="text-lg font-semibold text-gray-700">{team.name}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">팀이 없습니다.</p>
                )}

                {/* 버튼과 목록 간의 간격 추가 */}
                <div className="mt-6">
                    <button
                        onClick={() => setShowCreateTeamModal(true)}
                        className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
                    >
                        팀 생성
                    </button>
                </div>
            </div>

            {/* 오른쪽: 팀 초대 */}
            <div className="flex flex-col w-2/3 gap-6 mt-16">
                {/* 받은 팀 초대 */}
                <div className="bg-gray-100 rounded p-4 shadow max-h-[200px] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">받은 팀 초대</h3>
                    {receivedTeamInvitations.length > 0 ? (
                        receivedTeamInvitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="bg-white p-3 rounded shadow flex justify-between items-center"
                            >
                                <div>
                                    <span className="text-gray-700 font-bold">{invitation.teamName}</span>
                                    <p className="text-sm text-gray-500">보낸 사람: {invitation.senderName}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {} /* 수락 로직 추가 */}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        수락
                                    </button>
                                    <button
                                        onClick={() => {} /* 거절 로직 추가 */}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">받은 초대가 없습니다.</p>
                    )}
                </div>

                {/* 보낸 팀 초대 */}
                <div className="bg-gray-100 rounded p-4 shadow max-h-[200px] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">보낸 팀 초대</h3>
                    {sentTeamInvitations.length > 0 ? (
                        sentTeamInvitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="bg-white p-3 rounded shadow flex justify-between items-center"
                            >
                                <div>
                                    <span className="text-gray-700 font-bold">{invitation.teamName}</span>
                                    <p className="text-sm text-gray-500">받는 사람: {invitation.receiverName}</p>
                                </div>
                                <button
                                    onClick={() => {} /* 취소 로직 추가 */}
                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    취소
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">보낸 초대가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 팀 생성 모달 */}
            <TeamCreateModal
                showCreateTeamModal={showCreateTeamModal}
                setShowCreateTeamModal={setShowCreateTeamModal}
                newTeamName={newTeamName}
                setNewTeamName={setNewTeamName}
                friends={friends}
                selectedFriends={selectedFriends}
                handleFriendSelect={handleFriendSelect}
                handleRemoveFriend={handleRemoveFriend}
                handleAddTeam={handleAddTeam}
            />

            {/* 컨텍스트 메뉴 */}
            {teamContextMenu && (
                <div
                    className="fixed bg-white shadow-lg rounded p-2"
                    style={{
                        top: `${teamContextMenu.mouseY}px`, // 요소의 상단
                        left: `${teamContextMenu.mouseX}px`, // 요소의 오른쪽
                        zIndex: 50,
                    }}
                >
                    <button
                        onClick={() => handleViewTeamMembers(selectedTeam.teamId)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                        팀 멤버 확인
                    </button>
                    <button
                        onClick={handleLeaveTeam}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                    >
                        팀 탈퇴
                    </button>
                </div>
            )}

            {/* 탈퇴 확인 모달 */}
            {leaveConfirmModal.visible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-1/3">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            정말 이 팀에서 탈퇴하시겠습니까?
                        </h3>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() =>
                                    setLeaveConfirmModal({ visible: false, teamId: null })
                                }
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmLeaveTeam}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                탈퇴
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 팀 멤버 컨텍스트 메뉴 */}
            {teamMembersContext.visible && (
                <div
                    ref={teamMembersContextRef} // Ref로 DOM 연결
                    className="fixed bg-white shadow-lg rounded-lg p-6 w-[400px] max-h-[500px] overflow-y-auto"
                    style={{
                        top: `${teamMembersContext.y}px`,
                        left: `${teamMembersContext.x}px`,
                        zIndex: 50,
                    }}
                >
                    {/* 헤더 */}
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg">
                        <h4 className="text-lg font-bold">팀 멤버</h4>
                    </div>

                    {/* 멤버 리스트 */}
                    {teamMembersContext.members.length > 0 ? (
                        <ul className="space-y-3 p-4">
                            {teamMembersContext.members.map((member, index) => (
                                <li
                                    key={member.id}
                                    className="flex items-center bg-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                                >
                                    {/* 번호 */}
                                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4">
                                        {index + 1}
                                    </div>
                                    {/* 이름 및 이메일 */}
                                    <div>
                                        <p className="text-lg font-bold text-gray-700">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center text-gray-500 h-24">
                            <p>멤버가 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeamsManagement;