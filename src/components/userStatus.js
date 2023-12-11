import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TescoABI from '../abi/TescoABI.json';
import UserStatus from './userStatus.css';
const userStatus = ({ tescoAddress }) => {
    const [users, setUsers] = useState({ active: [], loyal: [] });

    useEffect(() => {
        const fetchAndCategorizeUsers = async () => {
            if (!tescoAddress) {
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const tescoContract = new ethers.Contract(tescoAddress, TescoABI, provider);

            try {
                const userAddresses = await tescoContract.getAllUserAddresses();
                const activeUsers = [];
                const loyalUsers = [];

                for (const address of userAddresses) {
                    const [purchaseDetails, tokenAwards] = await tescoContract.getPurchaseAndRedemptionDetails(address);
                    const recentPurchases = purchaseDetails.filter(detail => detail.purchaseTime >= (Date.now() / 1000 - (7 * 24 * 60 * 60)));

                    if (recentPurchases.length > 2) {
                        activeUsers.push(address);

                        const usedLoyaltyPoints = tokenAwards.length > 0;
                        if (usedLoyaltyPoints) {
                            loyalUsers.push(address);
                        }
                    }
                }

                setUsers({ active: activeUsers, loyal: loyalUsers });
            } catch (error) {
                console.error('Error categorizing users:', error);
            }
        };

        fetchAndCategorizeUsers();
    }, [tescoAddress]);

    return (
        <div className="user-status">
            <h2>User Status</h2>
            <div className="user-category">
                <h3>Active Users</h3>
                {users.active.map((address, index) => (
                    <p key={index}>
                        <img src="path-to-logo.png" alt="Logo" className="user-logo" />
                        {address}
                    </p>
                ))}
            </div>
            <div className="user-category">
                <h3>Loyal Users</h3>
                {users.loyal.map((address, index) => (
                    <p key={index}>
                        <img src="path-to-logo.png" alt="Logo" className="user-logo" />
                        {address}
                    </p>
                ))}
            </div>
        </div>
    );
};



export default userStatus;
