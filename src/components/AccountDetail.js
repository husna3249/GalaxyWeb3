// AccountDetails.js

import React, { useEffect, useState } from 'react';

const AccountDetails = ({ Tesco, address }) => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [tokenAwards, setTokenAwards] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (Tesco && address) {
        const history = await Tesco.getPurchaseAndRedemptionDetails(address);
        setPurchaseHistory(history[0]);
        setTokenAwards(history[1]);
      }
    };

    fetchDetails();
  }, [Tesco, address]);

  return (
    <div>
      <h2>Account Details</h2>
      <h3>Purchase History:</h3>
      {/* Map over purchaseHistory to display each transaction */}
      <h3>Token Awards:</h3>
      {/* Map over tokenAwards to display each award */}
    </div>
  );
};

export default AccountDetails;
