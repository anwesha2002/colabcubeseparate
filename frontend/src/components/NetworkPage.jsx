import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, currentUser, onConnect }) => {
  const tokenCost = {
    1: 5, 2: 10, 3: 15, 4: 20, 5: 30,
    10: 50, 20: 60, 30: 70, 40: 80, 50: 150, 100: 300
  };

  const cost = tokenCost[user.level] || tokenCost[Object.keys(tokenCost).reduce((a, b) => Math.abs(b - user.level) < Math.abs(a - user.level) ? b : a)];
  const canConnect = currentUser.tokens >= cost && !currentUser.connections.includes(user._id);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 m-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
      <div className="flex items-center mb-4">
        <img
          src={user.profilePicture || 'https://via.placeholder.com/50'}
          alt={`${user.username}'s profile`}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h3 className="text-xl font-bold">{user.username}</h3>
          <p className="text-gray-600">Level: {user.level}</p>
        </div>
      </div>
      <p className="text-gray-600 mb-4">Connection Cost: {cost} tokens</p>
      <button
        onClick={() => onConnect(user._id, cost)}
        disabled={!canConnect}
        className={`w-full py-2 px-4 rounded ${
          canConnect
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {currentUser.connections.includes(user._id) ? 'Connected' : 'Connect'}
      </button>
    </div>
  );
};

const NetworkPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const [usersResponse, currentUserResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: token } }),
          axios.get('http://localhost:5000/api/user', { headers: { Authorization: token } })
        ]);
        setUsers(usersResponse.data.filter(user => user && user._id !== currentUserResponse.data._id));
        setCurrentUser(currentUserResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleConnect = async (targetUserId, cost) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/connect', 
        { targetUserId },
        { headers: { Authorization: token } }
      );
      setCurrentUser(response.data);
    
      setUsers(prevUsers => prevUsers.map(user => 
        user._id === response.data._id ? response.data : user
      ));
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Failed to connect. Please try again.');
    }
  };

  const filteredUsers = users.filter(user =>
    user && user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Network</h1>
        <div className="bg-blue-500 text-white px-4 py-2 rounded">
          Wallet: {currentUser.tokens} tokens
        </div>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Discover</h2>
      </div>
      <div className="flex flex-wrap -mx-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard
              key={user._id}
              user={user}
              currentUser={currentUser}
              onConnect={handleConnect}
            />
          ))
        ) : (
          <p className="text-gray-600">No users found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;