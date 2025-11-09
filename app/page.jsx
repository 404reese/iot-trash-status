// app/page.js
'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (fillLevel) => {
    if (fillLevel >= 80) return 'bg-red-500';
    if (fillLevel >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (fillLevel) => {
    if (fillLevel >= 80) return 'Critical - Needs Emptying!';
    if (fillLevel >= 50) return 'Moderate - Monitor Soon';
    return 'Good - Sufficient Space';
  };

  // Dummy data for the other trash cans
  const dummyTrashCans = [
    {
      id: 2,
      name: 'Room No 202',
      fillLevel: 35,
      distance: 65,
      location: '2nd floor',
      status: 'offline'
    },
    {
      id: 3,
      name: 'Room No 203',
      fillLevel: 72,
      distance: 28,
      location: '2nd floor',
      status: 'offline'
    }
  ];

  const TrashCanCard = ({ name, fillLevel, distance, location, status, isLive = false, timestamp = null }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
              <p className="text-blue-100 text-sm">📍 {location}</p>
            </div>
            <div className="text-5xl">🗑️</div>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            {isLive ? (
              <div className="flex items-center gap-2 bg-green-500 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-500 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white text-xs font-bold">OFFLINE</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Fill Level */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">Fill Level</span>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">{fillLevel}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full ${getStatusColor(fillLevel)} transition-all duration-500 rounded-full`}
                style={{ width: `${fillLevel}%` }}
              ></div>
            </div>
            
            {/* Status Text */}
            <p className={`mt-2 text-sm font-semibold ${
              fillLevel >= 80 ? 'text-red-600 dark:text-red-400' :
              fillLevel >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {getStatusText(fillLevel)}
            </p>
          </div>

          {/* Distance */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📏</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distance</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{distance} cm</p>
              </div>
            </div>
          </div>

          {/* Timestamp (only for live) */}
          {isLive && timestamp && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-mono text-gray-800 dark:text-white">
                  {new Date(timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-2xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <span className="text-6xl">🗑️</span>
            Smart Dustbin Monitor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Real-time IoT Trash Management System
          </p>
        </div>

        {/* Trash Cans Grid - 3 per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Live Trash Can #1 */}
          {data?.timestamp ? (
            <TrashCanCard
              name="Room No 201"
              fillLevel={data.fillLevel}
              distance={data.distance}
              location="2nd floor"
              status="live"
              isLive={true}
              timestamp={data.timestamp}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center">
              <span className="text-6xl mb-4 block">⚠️</span>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                No data received yet.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Waiting for sensor data...
              </p>
            </div>
          )}

          {/* Dummy Trash Cans */}
          {dummyTrashCans.map((trashCan) => (
            <TrashCanCard
              key={trashCan.id}
              name={trashCan.name}
              fillLevel={trashCan.fillLevel}
              distance={trashCan.distance}
              location={trashCan.location}
              status={trashCan.status}
              isLive={false}
            />
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>🔄 Live data auto-refreshing every 2 seconds</p>
        </div>
      </div>
    </div>
  );
}