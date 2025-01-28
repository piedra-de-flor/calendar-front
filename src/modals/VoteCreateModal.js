import React, { useState } from 'react';
import moment from 'moment';
import 'moment/locale/ko';
import {createVote} from "../api/VoteApi";
import {useAlert} from "../root/AlertProvider";

const VoteCreateModal = ({ isOpen, onClose, availableSlots, teamId }) => {
    const { addAlert } = useAlert();
    const [voteTitle, setVoteTitle] = useState('');
    const [voteDescription, setVoteDescription] = useState('');
    const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState([]);

    if (!isOpen) return null;
    moment.locale('ko');
    const toggleSelection = (slot) => {
        setSelectedSlots((prev) => {
            if (prev.includes(slot)) {
                return prev.filter((item) => item !== slot);
            }
            return [...prev, slot];
        });
    };

    const selectAll = () => {
        if (selectedSlots.length === availableSlots.length) {
            setSelectedSlots([]); // 모든 선택 해제
        } else {
            setSelectedSlots(availableSlots); // 모든 선택
        }
    };

    const handleSubmit = async () => {
        const voteOptions = selectedSlots.map(
            (slot) =>
                `${moment(slot.start).format('YYYY-MM-DD HH:mm')} - ${moment(slot.end).format(
                    'YYYY-MM-DD HH:mm'
                )}`
        );

        const voteData = {
            teamId,
            voteTitle,
            voteDescription,
            isMultipleVote: allowMultipleVotes,
            voteOptions,
        };

        try {
            const response = await createVote(voteData);
            onClose(); // 모달 닫기
        } catch (error) {
            console.error('Failed to create vote:', error);
            addAlert(error.response.data.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-8">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">투표 생성</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        ✕
                    </button>
                </div>
                {/* Form Section */}
                <div className="space-y-6">
                    {/* 투표 제목 */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700">투표 제목</label>
                        <input
                            type="text"
                            value={voteTitle}
                            onChange={(e) => setVoteTitle(e.target.value)}
                            className="w-full mt-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="투표 제목을 입력하세요"
                        />
                    </div>
                    {/* 투표 설명 */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700">투표 설명</label>
                        <textarea
                            value={voteDescription}
                            onChange={(e) => setVoteDescription(e.target.value)}
                            className="w-full mt-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="투표 설명을 입력하세요"
                            rows={3}
                        />
                    </div>
                    {/* 중복 투표 허용 */}
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={allowMultipleVotes}
                            onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                            className="h-5 w-5 text-blue-500 focus:ring-blue-400"
                        />
                        <label className="text-lg text-gray-700">중복 투표 허용</label>
                    </div>
                    {/* 시간 선택 */}
                    <div>
                        <button
                            onClick={selectAll}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                        >
                            {selectedSlots.length === availableSlots.length ? '모두 선택 해제' : '모두 선택'}
                        </button>
                        <ul className="max-h-80 mt-4 overflow-y-auto space-y-2">
                            {availableSlots.map((slot, index) => (
                                <li
                                    key={index}
                                    className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center ${
                                        selectedSlots.includes(slot)
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                                    }`}
                                    onClick={() => toggleSelection(slot)}
                                >
                                    <span className="text-gray-800">
                                        {moment(slot.start).format('dddd / YYYY-MM-DD HH:mm')} ~{' '}
                                        {moment(slot.end).format('YYYY-MM-DD HH:mm')}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        가능 멤버: {slot.availableMembers.join(', ')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Footer */}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoteCreateModal;
