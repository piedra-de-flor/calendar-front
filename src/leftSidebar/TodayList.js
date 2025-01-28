import React, { useState, useEffect } from 'react';
import { fetchTodayTasks } from '../api/todayApi';

const TodayList = ({ refreshTrigger }) => {
    const [todayTasks, setTodayTasks] = useState([]); // 오늘의 작업 데이터
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    let isMounted = false;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 오늘의 작업 데이터 가져오기
                const updatedTasks = await fetchTodayTasks();
                setTodayTasks(updatedTasks);
                setLoading(false);
            } catch (err) {
                setError("Failed to load today's tasks");
                setLoading(false);
            }
        };

        if (!isMounted) {
            isMounted = true;
            fetchData();
        }
    }, [refreshTrigger]);


    if (loading) {
        return <div className="text-center text-gray-600">Loading today's tasks...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="today-list p-6 bg-white shadow rounded-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Today's Schedule</h3>
            <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
                {todayTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">No tasks scheduled for today.</p>
                ) : (
                    todayTasks.map((task) => (
                        <div
                            key={task.id}
                            className="mb-4 p-4 rounded-lg shadow flex items-center justify-between"
                            style={{
                                backgroundColor: task.categoryColor,
                                color: 'white',
                            }}
                        >
                            <div>
                                <p className="text-sm font-semibold">{task.description}</p>
                                <p className="text-xs">{`${task.start} - ${task.end}`}</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-white text-gray-800 rounded-lg shadow">
                                {`${task.start.split(':')[0]}:${task.start.split(':')[1]} ~ ${task.end.split(':')[0]}:${task.end.split(':')[1]}`}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TodayList;
