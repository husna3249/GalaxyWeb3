import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LoyaltyTokenABI from '../abi/LoyaltyTokenABI.json';
import TescoRewardNFTABI from '../abi/TescoRewardNFTABI.json';
import { Counter } from './Counter';
import "./MyLoyalty.css";

const MyLoyalty = ({ Tesco, userAddress, contractOwnerAddress }) => {
    const [loyaltyTokenContract, setLoyaltyTokenContract] = useState(null);
    const [tescoRewardNFTContract, setTescoRewardNFTContract] = useState(null);
    const [tescoBalance, setTescoBalance] = useState("0");
    const [data, setData] = useState({
        totalSupply: 0,
        nftsIssued: 0,
        tokensIssued: 0,
        tokensBurnt: 0,
        nftTransfers: 0,
        
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [burntTokens, setBurntTokens] = useState("0");
    const [nftTransfers, setNftTransfers] = useState("0");
    useEffect(() => {
        if (Tesco && userAddress === contractOwnerAddress) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const loyaltyTokenAddress = "0x901AFE8b21a79827c490df95B3E5fC9F08D8feDA"; 
            const tescoRewardNFTAddress = "0x24Dddb4aECc1B27Fcf79905a4076c0fEA858F9B7"; 

            const loyaltyToken = new ethers.Contract(loyaltyTokenAddress, LoyaltyTokenABI, signer);
            const tescoRewardNFT = new ethers.Contract(tescoRewardNFTAddress, TescoRewardNFTABI, signer);

            setLoyaltyTokenContract(loyaltyToken);
            setTescoRewardNFTContract(tescoRewardNFT);
        }
    }, [Tesco, userAddress, contractOwnerAddress]);
    const fetchAdditionalData = async () => {
        if (!loyaltyTokenContract || !tescoRewardNFTContract) return;
    
        try {
            const burntTokensCount = await loyaltyTokenContract.getTotalBurntTokens();
            const nftTransferCount = await tescoRewardNFTContract.getTotalNftTransfers();
    
            setBurntTokens(burntTokensCount.toString());
            setNftTransfers(nftTransferCount.toString());
        } catch (error) {
            console.error("Error fetching additional data:", error);
            setIsError(true);
        }
    };
    

    useEffect(() => {
        fetchAdditionalData();
    }, [loyaltyTokenContract, tescoRewardNFTContract]);

    const fetchData = async () => {
        if (!loyaltyTokenContract || !tescoRewardNFTContract) return;

        setIsLoading(true);
        setIsError(false);

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const totalSupply = await loyaltyTokenContract.totalSupply();
            const nftsIssued = await tescoRewardNFTContract.totalSupply();
            const balance = await provider.getBalance(Tesco.address);

            setData({
                totalSupply: totalSupply.toString(),
                nftsIssued: nftsIssued.toString(),
                // Other data...
            });

            setTescoBalance(ethers.utils.formatEther(balance));

        } catch (error) {
            console.error("Error fetching data:", error);
            setIsError(true);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [loyaltyTokenContract, tescoRewardNFTContract, Tesco]);

    if (userAddress !== contractOwnerAddress) {
        return <p>Access Denied</p>;
    }

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (isError) {
        return <p>Error loading data.</p>;
    }

    return (
        <div className="my-loyalty-dashboard">
            <h2 className="dashboard-title">My Loyalty Dashboard</h2>
            <div className="dashboard-section">
                <div className="dashboard-item">
                    <label>Tesco Contract Balance:</label>
                    <p>{tescoBalance} ETH</p>
                </div>
                <div className="dashboard-item">
    <label>Total Tokens Supply:</label>
    <div className="counter-wrapper">
        <Counter end={data.totalSupply} duration={1} />
    </div>
</div>
<div className="dashboard-item">
    <label>NFTs Issued: </label>
    <div className="counter-wrapper">
        <Counter end={data.nftsIssued} duration={1} />
    </div>
</div>
 

                
<div className="dashboard-item">
    <label>Total Tokens Burnt:</label>
    <div className="counter-wrapper">
        <Counter end={burntTokens} duration={1} />
    </div>
</div>
<div className="dashboard-item">
    <label>Total NFT Transfers:</label>
    <div className="counter-wrapper">
        <Counter end={nftTransfers} duration={1.2} />
    </div>
</div>
</div>
        </div>
    );
};

export default MyLoyalty;
