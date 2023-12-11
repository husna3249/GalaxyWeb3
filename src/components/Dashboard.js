import React, { useState } from 'react';
import MyLoyalty from './MyLoyalty';
import UserActivity from './UserActivity';
import UserStatus from './userStatus'; // Import the UserStatus component
import './Dashboard.css';
import metrics from '../img/metrics.png';
import users from '../img/users.png';
import statusIcon from '../img/status.png'; 
import nftIcon from '../img/nft1.png';
import NFTDisplay from './NFTDisplay'; // Add this import


const Dashboard = ({ Tesco, userAddress, contractOwnerAddress }) => {
    const [activeSection, setActiveSection] = useState('myLoyalty');

    return (
        <div className="dashboard">
            <nav className="sidebar">
                <div className="logo">
                
                  
                </div>
                <ul>
                    <li className={activeSection === 'myLoyalty' ? 'active' : ''}
                        onClick={() => setActiveSection('myLoyalty')}>
                        <img src={users} alt="My Loyalty" />
                        <span>My Loyalty</span>
                    </li>
                    <li className={activeSection === 'userActivity' ? 'active' : ''}
                        onClick={() => setActiveSection('userActivity')}>
                        <img src={metrics} alt="User Activity" />
                        <span>User Activity</span>
                    </li>
                    <li className={activeSection === 'UserStatus' ? 'active' : ''}
                        onClick={() => setActiveSection('UserStatus')}>
                        <img src={statusIcon} alt="User Status" />
                        <span>User Status</span>
                    </li>
                    <li className={activeSection === 'nftDisplay' ? 'active' : ''}
    onClick={() => setActiveSection('nftDisplay')}>
    <img src={nftIcon} alt="NFT Display" />
    <span>NFT Display</span>
</li>
    
                </ul>
            </nav>
            <div className="main-content">
                {activeSection === 'myLoyalty' && <MyLoyalty Tesco={Tesco} userAddress={userAddress} contractOwnerAddress={contractOwnerAddress} />}
                {activeSection === 'userActivity' && <UserActivity Tesco={Tesco} userAddress={userAddress} contractOwnerAddress={contractOwnerAddress} />}
                {activeSection === 'UserStatus' && <UserStatus Tesco={Tesco} userAddress={userAddress} contractOwnerAddress={contractOwnerAddress} />}
                {activeSection === 'nftDisplay' && <NFTDisplay />}
            </div>
        </div>
    );
};

export default Dashboard;
