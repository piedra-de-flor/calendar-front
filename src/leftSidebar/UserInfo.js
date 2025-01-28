import React, { useState, useEffect } from "react";
import { fetchUserInfo } from "../api/userApi";
import {fetchTodayTasks} from "../api/todayApi";

const UserInfo = () => {
    const [userInfo, setUserInfo] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    let isMounted = false;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await fetchUserInfo();
                setUserInfo(userResponse);
                setLoading(false);
            } catch (err) {
                setError("Failed to load user information");
                setLoading(false);
            }
        };

        if (!isMounted) {
            isMounted = true;
            fetchData();
        }
    }, []);

    if (loading) {
        return <div className="text-center text-gray-600">Loading user information...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="user-info bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                    Name: <span className="text-gray-900">{userInfo.name}</span>
                </p>
                <p className="text-lg font-semibold text-gray-700">
                    Email: <span className="text-gray-900">{userInfo.email}</span>
                </p>
            </div>
        </div>
    );
};

export default UserInfo;
