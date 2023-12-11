import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TescoABI from '../abi/TescoABI.json';
import './UserActivity.css'; // Import the CSS file

const UserActivity = ({ Tesco, userAddress }) => {
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Number of items per page

    useEffect(() => {
        const fetchPurchaseHistory = async () => {
            if (Tesco) {
                const [purchaseDetails] = await Tesco.getPurchaseAndRedemptionDetails(userAddress);
    
                const detailedHistory = await Promise.all(purchaseDetails.map(async (detail, index) => {
                    const buyerAddress = await Tesco.buyerInfo(index);
    
                    const purchaseDetail = {
                        serialNo: index + 1,
                        buyerAddress: buyerAddress,
                        productId: detail.productId.toString(),
                        purchaseTime: new Date(detail.purchaseTime.toNumber() * 1000).toLocaleString(),
                        paymentMethod: detail.paymentMethod === 0 ? 'Ether' : 'Loyalty Points',
                    };
    
                    return purchaseDetail;
                }));
    
                setPurchaseHistory(detailedHistory);
                setIsLoading(false);
            }
        };
    
        fetchPurchaseHistory();
    }, [Tesco, userAddress]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = purchaseHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(purchaseHistory.length / itemsPerPage);

    const handlePreviousClick = () => {
        setCurrentPage(currentPage - 1);
    };

    const handleNextClick = () => {
        setCurrentPage(currentPage + 1);
    };

    if (isLoading) {
        return <p className="loading-message">Loading user activities...</p>;
    }

    return (
        <div className="user-activity-container">
            <h2>User Activity</h2>
            <table className="user-activity-table">
                <thead>
                    <tr>
                        <th>Serial No</th>
                        <th>Buyer Address</th>
                        <th>Product ID</th>
                        <th>Time of Purchase</th>
                        <th>Payment Method</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((purchase, index) => (
                        <tr key={index}>
                            <td>{purchase.serialNo}</td>
                            <td>{purchase.buyerAddress}</td>
                            <td>{purchase.productId}</td>
                            <td>{purchase.purchaseTime}</td>
                            <td>{purchase.paymentMethod}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={handlePreviousClick} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextClick} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
    );
};

export default UserActivity;
