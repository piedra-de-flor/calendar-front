import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {fetchTeamMembers} from "../api/TeamApi";
import {fetchAvailableSlots} from "../api/AvailableSlotsApi";
import VoteCreateModal from './VoteCreateModal'; // VoteCreateModal 추가

const AvailableSlotsModal = ({ isOpen, onClose, teams, setCalendar }) => {
    const [currentStep, setCurrentStep] = useState(1); // 현재 단계 (1: 팀 선택, 2: 공통 일정 설정)
    const [selectedTeam, setSelectedTeam] = useState(null); // 반드시 초기값은 null
    const [teamMembers, setTeamMembers] = useState([]); // 팀 멤버 목록
    const [membersLoading, setMembersLoading] = useState(false); // 멤버 로딩 상태
    const [memberError, setMemberError] = useState(''); // 멤버 로딩 에러
    const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().add(7, 'days').format('YYYY-MM-DD'));
    const [availableFrom, setAvailableFrom] = useState('09:00');
    const [availableTo, setAvailableTo] = useState('18:00');
    const [minDurationMinutes, setMinDurationMinutes] = useState(30);
    const [minMembers, setMinMembers] = useState(2);
    const [minGapMinutes, setMinGapMinutes] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [availableSlots, setAvailableSlots] = useState([]);
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedTeam(null); // 선택 초기화
            setSelectedTeam(null); // 선택 초기화
            setTeamMembers([]); // 멤버 초기화
            setMemberError('');
            setAvailableSlots([]); // 공통 일정 초기화
        }
    }, [isOpen]);

    // 팀 선택 시 멤버 가져오기
    useEffect(() => {
        if (selectedTeam) {
            const fetchMembers = async () => {
                setMembersLoading(true);
                setMemberError('');
                try {
                    const members = await fetchTeamMembers(selectedTeam.teamId);
                    setTeamMembers(members);
                } catch (err) {
                    setMemberError('팀 멤버를 가져오는 데 실패했습니다.');
                } finally {
                    setMembersLoading(false);
                }
            };

            fetchMembers();
        } else {
            setTeamMembers([]); // 선택 취소 시 멤버 초기화
        }
    }, [selectedTeam]);


    const fetchSlots = async () => {
        try {
            setLoading(true);
            setError('');

            const slots = await fetchAvailableSlots({
                teamId: selectedTeam.teamId,
                startDate,
                endDate,
                availableFrom,
                availableTo,
                minDurationMinutes,
                minMembers,
                minGapMinutes,
            });

            setAvailableSlots(slots);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            setError('팀을 선택하세요.');
            // 2단계로 넘어가기 전 availableSlots 초기화
            setAvailableSlots([]);
        }
        setError('');
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {currentStep === 1 ? '팀 선택' : '공통 일정 설정'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div>
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* 팀 선택 안내 */}
                            <p className="text-gray-700">공통 일정을 설정할 팀을 선택하세요.</p>
                            <ul className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                                {teams.map((team) => {
                                    const isSelected = selectedTeam?.teamId === team.teamId;
                                    return (
                                        <li
                                            key={team.id}
                                            onClick={() => setSelectedTeam(team)}
                                            className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                    ? 'bg-blue-100 border-blue-500'
                                                    : 'bg-white hover:bg-gray-100 border-gray-300'
                                            }`}
                                        >
                                            <span className="font-medium text-gray-800">{team.name}</span>
                                            {isSelected && (
                                                <span className="text-blue-500 font-semibold">선택됨</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* 팀 멤버 */}
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">팀 멤버</h3>
                                {membersLoading ? (
                                    <div className="flex justify-center">
                                        <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 rounded-full"></div>
                                        <span className="ml-2 text-gray-500">로딩 중...</span>
                                    </div>
                                ) : memberError ? (
                                    <p className="text-red-500 text-center">{memberError}</p>
                                ) : (
                                    <ul className="grid grid-cols-3 gap-4 max-h-40 overflow-y-auto">
                                        {teamMembers.map((member) => (
                                            <li
                                                key={member.id}
                                                className="p-3 border rounded-lg flex items-center"
                                            >
                                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <span className="ml-3 text-gray-800">{member.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="flex space-x-8">
                            {/* 왼쪽 설정 폼 */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium">시작 날짜</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium">종료 날짜</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-gray-700 font-medium">가능 시작 시간</label>
                                        <input
                                            type="time"
                                            value={availableFrom}
                                            onChange={(e) => setAvailableFrom(e.target.value)}
                                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-gray-700 font-medium">가능 종료 시간</label>
                                        <input
                                            type="time"
                                            value={availableTo}
                                            onChange={(e) => setAvailableTo(e.target.value)}
                                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium">최소 지속 시간 (분)</label>
                                    <input
                                        type="number"
                                        value={minDurationMinutes}
                                        onChange={(e) => setMinDurationMinutes(e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium">최소 팀원 수</label>
                                    <input
                                        type="number"
                                        value={minMembers}
                                        onChange={(e) => setMinMembers(e.target.value)}
                                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 오른쪽 공통 시간 슬롯 */}
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800">공통 가능한 시간 슬롯</h3>
                                    {availableSlots.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setCalendar({ highlightedSlots: availableSlots }); // 캘린더에 데이터 전달
                                                onClose(); // 모달 닫기
                                            }}
                                            className="text-blue-500 hover:underline"
                                        >
                                            캘린더에서 보기
                                        </button>
                                    )}
                                </div>
                                {loading ? (
                                    <div className="flex justify-center">
                                        <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 rounded-full"></div>
                                        <span className="ml-2 text-gray-500">로딩 중...</span>
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <ul className="space-y-2">
                                        {availableSlots.map((slot, index) => (
                                            <li
                                                key={index}
                                                className="p-3 bg-white border rounded-lg"
                                            >
                                                <p className="text-gray-800">
                                                    {moment(slot.start).format('YYYY-MM-DD HH:mm')} -{' '}
                                                    {moment(slot.end).format('YYYY-MM-DD HH:mm')}
                                                </p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    가능 멤버: {slot.availableMembers.join(', ')}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-center">공통 가능한 시간이 없습니다.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between items-center">
                    {currentStep === 1 && (
                        <div className="flex justify-end w-full">
                            <button
                                onClick={handleNext}
                                disabled={!selectedTeam} // 팀이 선택되지 않으면 비활성화
                                className={`px-6 py-2 rounded-lg ${
                                    selectedTeam
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-gray-300 text-gray-800 cursor-not-allowed'
                                }`}
                            >
                                다음
                            </button>
                        </div>
                    )}
                    {currentStep > 1 && (
                        <div className="flex justify-between items-center w-full">
                            {/* "뒤로" 버튼 - 왼쪽 끝 */}
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                            >
                                뒤로
                            </button>

                            {/* 오른쪽 버튼 그룹 - "투표 생성"과 "공통 일정 찾기" */}
                            <div className="flex space-x-4">
                                {currentStep === 2 && availableSlots.length > 1 && (
                                    <button
                                        onClick={() => setIsVoteModalOpen(true)}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        투표 생성
                                    </button>
                                )}
                                <button
                                    onClick={currentStep === 2 ? fetchSlots : handleNext}
                                    disabled={loading}
                                    className={`px-6 py-2 rounded-lg ${
                                        loading
                                            ? 'bg-blue-300 text-white cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {loading ? '로딩 중...' : currentStep === 2 ? '공통 일정 찾기' : '다음'}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* VoteCreateModal 연결 */}
                    <VoteCreateModal
                        isOpen={isVoteModalOpen}
                        onClose={() => {
                            setIsVoteModalOpen(false); // 자식 모달 닫기
                            onClose(); // 부모 모달 닫기
                        }}
                        availableSlots={availableSlots}
                        teamId={selectedTeam?.teamId} // 선택된 팀의 ID 전달
                    />
                </div>
            </div>
        </div>
    );
};

export default AvailableSlotsModal;
