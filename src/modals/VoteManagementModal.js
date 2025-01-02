import { useEffect, useState } from "react";
import { readVotes, vote, readVote, completeVote, resultVote } from "../api/VoteApi";
import {useAlert} from "../root/AlertProvider";

const VoteManagementModal = ({ teamId, onClose }) => {
    const { addAlert } = useAlert();
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedVote, setSelectedVote] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [resultIds, setResultIds] = useState([]);

    const fetchVotes = async () => {
        try {
            setLoading(true);
            const voteData = await readVotes(teamId);
            setVotes(voteData);
        } catch (err) {
            console.error("Error fetching votes:", err);
            addAlert("투표 데이터를 불러오는데 실패했습니다.")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVotes();
    }, [teamId]);

    const handleVoteDoubleClick = async (vote) => {
        setDetailsLoading(true);
        try {
            const detailedVote = await readVote(vote.voteId);
            setSelectedVote(detailedVote);
            setSelectedOptions([]);

            if (vote.voteStatus === "CLOSED") {
                const results = await resultVote(vote.voteId);
                setResultIds(Object.keys(results.results).map((id) => parseInt(id, 10)));
            } else {
                setResultIds([]);
            }
        } catch (err) {
            console.error("Error fetching detailed vote or result:", err);
            addAlert("투표 데이터를 불러오는데 실패했습니다.")
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleVoteSubmit = async () => {
        if (selectedOptions.length === 0) {
            addAlert("최소 한 개의 옵션을 선택해야 합니다!")
            return;
        }

        const optionIds = selectedOptions.map((optionName) => {
            const votesData = selectedVote.options[optionName];
            return parseInt(Object.keys(votesData)[0], 10);
        });

        try {
            await vote(selectedVote.voteId, optionIds);
            addAlert("투표 성공")
            setSelectedVote(null);
            setSelectedOptions([]);
        } catch (error) {
            addAlert("투표중 오류가 발생했습니다.")
        }
    };

    const handleCompleteVote = async () => {
        if (!window.confirm("정말로 이 투표를 종료하시겠습니까?")) return;

        try {
            await completeVote(selectedVote.voteId);
            addAlert("투표가 종료되었습니다.")
            setSelectedVote(null);
            await fetchVotes();
        } catch (error) {
            addAlert("투표 종료중 오류가 발생했습니다.")
        }
    };

    const handleCloseOptionModal = () => {
        setSelectedVote(null);
        setResultIds([]);
    };

    const formatDateTime = (dateTime) => {
        const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
        return new Date(dateTime).toLocaleString("en-US", options);
    };

    const formatRemainingTime = (closeAt) => {
        const now = new Date();
        const endTime = new Date(closeAt);
        const diffInMs = endTime - now;

        if (diffInMs <= 0) {
            return "마감되었습니다";
        }

        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes < 60) {
            return `마감 - ${diffInMinutes} Minutes`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        const days = Math.floor(diffInHours / 24);
        const hours = diffInHours % 24;

        return `마감 - ${days} Day${days !== 1 ? "s" : ""} ${hours} Hour${hours !== 1 ? "s" : ""}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl w-4/5 max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-3xl font-bold text-gray-900">투표 관리</h3>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl font-bold">
                            ✕
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 italic mb-4">
                        종료된 투표는 7일 후 자동 삭제됩니다.
                    </p>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-gray-500 text-lg">로딩 중...</div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 font-medium">{error}</div>
                    ) : votes.length > 0 ? (
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                            <h4 className="text-xl font-semibold text-gray-800 mb-4">현재 투표 목록</h4>
                            <div className="grid grid-cols-3 gap-6">
                                {votes.map((vote) => (
                                    <div
                                        key={vote.voteId}
                                        className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 transition-transform flex flex-col justify-between h-40"
                                        onDoubleClick={() => handleVoteDoubleClick(vote)}
                                    >
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                                {vote.voteTitle}
                                            </h4>
                                            <p className="text-sm font-medium text-gray-600">
                                                상태:{" "}
                                                <span
                                                    className={
                                                        vote.voteStatus === "OPEN"
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {vote.voteStatus}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <p>{formatRemainingTime(vote.closeAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-gray-500 text-lg">투표가 없습니다.</div>
                        </div>
                    )}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>

            {selectedVote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl w-4/5 max-h-[90vh] overflow-y-auto">
                        {detailsLoading ? (
                            <div className="text-gray-500 text-lg text-center">로딩 중...</div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-3xl font-bold text-gray-900">
                                        {selectedVote.voteTitle}
                                    </h3>
                                    <button
                                        onClick={handleCloseOptionModal}
                                        className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p className="text-md text-gray-700 mb-6">{selectedVote.description}</p>
                                <div className="text-sm text-gray-500 mb-8">
                                    <p>시작 시간: {formatDateTime(selectedVote.createdAt)}</p>
                                    <p>종료 시간: {formatDateTime(selectedVote.closeAt)}</p>
                                    <p>
                                        복수 투표 가능 여부:{" "}
                                        <span className={selectedVote.multiple ? "text-blue-600" : "text-red-600"}>
                                            {selectedVote.multiple ? "예" : "아니오"}
                                        </span>
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(selectedVote.options).map(([optionName, votesData]) => {
                                        const optionId = parseInt(Object.keys(votesData)[0], 10);
                                        const isResult = resultIds.includes(optionId);

                                        return (
                                            <div
                                                key={optionName}
                                                className={`p-4 rounded-lg shadow-md flex items-center justify-between ${
                                                    isResult
                                                        ? "bg-blue-100 border-2 border-blue-500"
                                                        : selectedVote.voteStatus === "CLOSED"
                                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                            : "bg-white text-black"
                                                }`}
                                            >
                                                <span className="text-lg font-medium">
                                                    {optionName}
                                                </span>
                                                <span className="text-lg font-medium">
                                                    {votesData[optionId]} 표
                                                </span>
                                                {selectedVote.voteStatus === "OPEN" && (
                                                    <input
                                                        type="checkbox"
                                                        className="ml-4 w-6 h-6 accent-blue-600"
                                                        checked={selectedOptions.includes(optionName)}
                                                        onChange={() => {
                                                            if (selectedVote.multiple) {
                                                                setSelectedOptions((prev) =>
                                                                    prev.includes(optionName)
                                                                        ? prev.filter((opt) => opt !== optionName)
                                                                        : [...prev, optionName]
                                                                );
                                                            } else {
                                                                setSelectedOptions([optionName]);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 flex justify-between">
                                    {selectedVote.voteStatus === "OPEN" ? (
                                        <>
                                            <button
                                                onClick={handleCompleteVote}
                                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md transition-colors"
                                            >
                                                투표 종료
                                            </button>
                                            <button
                                                onClick={handleVoteSubmit}
                                                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition-colors"
                                            >
                                                투표하기
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-gray-500 italic">이 투표는 종료되었습니다.</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoteManagementModal;
