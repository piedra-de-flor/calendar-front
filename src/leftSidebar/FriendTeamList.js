import React, { useState, useEffect } from 'react';
import { fetchFriends } from '../api/FriendApi';
import { fetchTeams } from '../api/TeamApi';
import { FaCog } from 'react-icons/fa';

const FriendTeamList = ({ onManageFriends, onManageTeams, refreshFriendListTrigger, refreshTeamListTrigger }) => {
    const [friends, setFriends] = useState([]); // 친구 목록
    const [teams, setTeams] = useState([]); // 팀 목록
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 친구 및 팀 목록 가져오기
                const [teamsData] = await Promise.all([
                    fetchTeams(),
                ]);

                setTeams(Array.isArray(teamsData) ? teamsData : []);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching friends or teams:', err.message);
                setError('Failed to load friends or teams');
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTeamListTrigger]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 친구 및 팀 목록 가져오기
                const [friendsData] = await Promise.all([
                    (await fetchFriends()).data,
                ]);

                setFriends(Array.isArray(friendsData) ? friendsData : []);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching friends or teams:', err.message);
                setError('Failed to load friends or teams');
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshFriendListTrigger]);

    if (loading) {
        return <div className="text-center text-gray-600">Loading friends and teams...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="friend-team-list p-6 bg-white shadow rounded-lg">
            {/* 친구 목록 */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Friends</h3>
                <button
                    className="text-gray-600 hover:text-gray-800"
                    title="Manage Friends"
                    onClick={onManageFriends}
                >
                    <FaCog size={20} />
                </button>
            </div>
            {Array.isArray(friends) && friends.length === 0 ? (
                <p className="text-gray-500">No friends found</p>
            ) : (
                <ul className="list-disc list-inside space-y-2 max-h-32 overflow-y-auto">
                    {friends.map((friend) => (
                        <li
                            key={friend.id}
                            className="p-2 bg-blue-100 text-blue-800 rounded shadow hover:bg-blue-200"
                        >
                            {friend.name}
                        </li>
                    ))}
                </ul>
            )}

            {/* 팀 목록 */}
            <div className="flex justify-between items-center mt-8 mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Teams</h3>
                <button
                    className="text-gray-600 hover:text-gray-800"
                    title="Manage Teams"
                    onClick={onManageTeams}
                >
                    <FaCog size={20} />
                </button>
            </div>
            {Array.isArray(teams) && teams.length === 0 ? (
                <p className="text-gray-500">No teams found</p>
            ) : (
                <ul className="list-disc list-inside space-y-2 max-h-32 overflow-y-auto">
                    {teams.map((team) => (
                        <li
                            key={team.id}
                            className="p-2 bg-green-100 text-green-800 rounded shadow hover:bg-green-200"
                        >
                            {team.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FriendTeamList;
