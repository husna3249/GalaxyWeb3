import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TescoABI from './abi/TescoABI.json';
import LoyaltyTokenABI from './abi/LoyaltyTokenABI.json';
import teaImage from './img/co.png';
import discord from './img/discord.jpg';
import twitter from './img/twitter.jpeg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link,useNavigate} from 'react-router-dom';
 import Dashboard  from './components/Dashboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const DashboardButton = ({ userAddress, contractOwnerAddress }) => {
    const navigate = useNavigate();

    return (
        userAddress === contractOwnerAddress && (
            <button
                className="dashboard-nav-button"
                onClick={() => navigate('/dashboard')}
            >
                Go to Dashboard
            </button>
        )
    );
};
const App = () => {
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [loyaltyPointsB, setLoyaltyPointsB] = useState("0");

    const [showMixedPaymentPopup, setShowMixedPaymentPopup] = useState(false);
    const [loyaltyTokenAmountForMixedPayment, setLoyaltyTokenAmountForMixedPayment] = useState('');
    const tescoAddress = "0xcc7782E833a5292f74db262aa6CdfE7Cf7735C29";
   
    const loyaltyTokenAddress="0x901AFE8b21a79827c490df95B3E5fC9F08D8feDA";
    
    const [Tesco, setTesco] = useState(null);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const contractOwnerAddress = "0x49e0cAdCD4C32a8be177FCb273d76BA7f10342C5";
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [showNewUserPopup, setShowNewUserPopup] = useState(false);
    const [buttonOneClicked, setButtonOneClicked] = useState(false);
    const [buttonTwoClicked, setButtonTwoClicked] = useState(false);
  

    const handleClosePopup = () => {
        setShowNewUserPopup(false);
    };
    

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setUserAddress(address);
                setIsWalletConnected(true);
                const tescoContract = new ethers.Contract(tescoAddress, TescoABI, signer);
                setTesco(tescoContract);
            } catch (error) {
                console.error("Error connecting to MetaMask:", error);
            }
        } else {
            console.error("MetaMask is not installed!");
        }
    };

    const checkIfNewUser = () => {
        const hasSeenPopup = localStorage.getItem('hasSeenNewUserPopup');
        if (!hasSeenPopup) {
            setShowNewUserPopup(true);
        }
    };

    const fetchLoyaltyPoints = async () => {
        if (Tesco && isWalletConnected) {
            const points = await Tesco.getTotalTokensHeldByBuyer(userAddress);
            setLoyaltyPoints(points);
        }
    };

    const handleNewUserAward = async () => {
        if (buttonOneClicked && buttonTwoClicked && Tesco && isWalletConnected) {
            try {
                const awardTx = await Tesco.awardNewUserPoints(userAddress, 5);
                await awardTx.wait();
                localStorage.setItem('hasSeenNewUserPopup', 'true');
                setShowNewUserPopup(false);
                setButtonOneClicked(false);
                setButtonTwoClicked(false);
                fetchLoyaltyPoints();
                toast.success("Congratulations! You have claimed 5 loyalty points.");
            } catch (error) {
                console.error("Error awarding new user points:", error);
                toast.error("Error claiming points.");
            }
        }
    };
    

    const buyProduct = async (productId) => {
        if (!Tesco) return;
        try {
            const productPriceInEther = productId === 1 ? '0.0001' : '0.00001';
            let buyProductTx;
            if (productId === 1) {
                buyProductTx = await Tesco.Coffee({ value: ethers.utils.parseEther(productPriceInEther) });
            } else if (productId === 2) {
                buyProductTx = await Tesco.tea({ value: ethers.utils.parseEther(productPriceInEther) });
            }
            await buyProductTx.wait();
            toast.success(`Successfully purchased ${productId === 1 ? 'Coffee' : 'Tea'}.`);
            fetchLoyaltyPoints();
        } catch (error) {
            console.error(`Error buying ${productId === 1 ? 'Coffee' : 'Tea'}:`, error);
            toast.error(`Error purchasing ${productId === 1 ? 'Coffee' : 'Tea'}.`);
        }
    };
    

    const handleMixedPayment = (productId) => {
        setSelectedProductId(productId);
        setShowMixedPaymentPopup(true);
    };

    const getRemainingPaymentInWei = async (productId, loyaltyPoints) => {
        if (!Tesco) return "0";
    
        try {
            const remainingPayment = await Tesco.calculateRemainingPayment(productId, loyaltyPoints);
            return remainingPayment.toString();
        } catch (error) {
            console.error("Error calculating remaining payment:", error);
            return "0";
        }
    };
    
    const handleConfirmMixedPayment = async () => {
        if (!Tesco || !selectedProductId) return;
    
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
    
            const loyaltyPointsToUse = parseInt(loyaltyTokenAmountForMixedPayment);
            if (isNaN(loyaltyPointsToUse) || loyaltyPointsToUse <= 0) {
                alert("Please enter a valid number of loyalty points to use.");
                return;
            }
    
            const remainingPaymentInWei = await getRemainingPaymentInWei(selectedProductId, loyaltyPointsToUse);
    
            const loyaltyTokenContract = new ethers.Contract(loyaltyTokenAddress, LoyaltyTokenABI, signer);
            const approvalTx = await loyaltyTokenContract.approve(tescoAddress, loyaltyPointsToUse);
            const approvalReceipt = await approvalTx.wait();
    
            if (approvalReceipt.status === 1) {
                const mixedPaymentTx = await Tesco.buyProductWithMixedPayment(selectedProductId, loyaltyPointsToUse, { value: remainingPaymentInWei });
                const paymentReceipt = await mixedPaymentTx.wait();
    
                if (paymentReceipt.status === 1) {
                    toast.success("Payment successful and loyalty points claimed.");
                    setShowMixedPaymentPopup(false);
                    fetchLoyaltyPoints();
                } else {
                    toast.error("Payment transaction failed.");
                }
            } else {
                console.error("Approval transaction failed");
                toast.error("Error in approval transaction.");
            }
        } catch (error) {
            console.error("Error with mixed payment:", error);
            toast.error("Error with mixed payment.");
        }
    };
    
    
    useEffect(() => {
        checkIfNewUser();
    }, [isWalletConnected]);

    useEffect(() => {
        if (isWalletConnected) {
            fetchLoyaltyPoints();
        }
    }, [isWalletConnected, Tesco, userAddress]);
    const refreshLoyaltyPoints = async () => {
        if (Tesco && isWalletConnected && userAddress) {
            try {
                const points = await Tesco.getTotalTokensHeldByBuyer(userAddress);
                setLoyaltyPointsB(points.toString());  
            } catch (error) {
                console.error("Error refreshing loyalty points:", error);
            }
        }
    };
    useEffect(() => {
        refreshLoyaltyPoints();
    }, [isWalletConnected, userAddress, Tesco]);
   
    return (
        <Router>
            <div className="app">
                <ToastContainer />
                <div className="header">
                    <Link to="/" className="title-link"><h1>Tesco Club</h1></Link>
                    <div className='nav-links'> 
                    <DashboardButton userAddress={userAddress} contractOwnerAddress={contractOwnerAddress} />
                        <button className={`wallet-button ${isWalletConnected ? 'connected' : ''}`} onClick={connectWallet}>
                            {isWalletConnected ? 'Connected' : 'Connect Wallet'}
                        </button>
                        
                    </div>
                </div>
                <Routes>
                    <Route path="/" element={
                        <div className="main-content">
                            <div className="loyalty-points-container">
                                <h3 className="loyalty-points-title">Your Loyalty Points:</h3>
                                <div className="loyalty-points-display">
                                    {loyaltyPointsB}
                                </div>
                            </div>
   
                            <div className="product">
                                <div className="product-image-container">
                                    <img src={teaImage} alt="Coffee" />
                                    <div className="loyalty-points-badge">+10pts</div>
                                </div>
                                <p>Price: 0.0001 ETH</p>
                                <button onClick={() => buyProduct(1)}>Buy Coffee</button>
                                <button onClick={() => handleMixedPayment(1)}>Mixed Payment for Coffee</button>
                            </div>
                            <div className="product">
                                <div className="product-image-container">
                                    <img src={teaImage} alt="Tea" />
                                    <div className="loyalty-points-badge">+10pts</div>
                                </div>
                                <p>Price: 0.00001 ETH</p>
                                <button onClick={() => buyProduct(2)}>Buy Tea</button>
                                <button onClick={() => handleMixedPayment(2)}>Mixed Payment for Tea</button>
                            </div>
                        </div>
                       
                    } />
                    
                    <Route path="/dashboard" element={<Dashboard Tesco={Tesco} userAddress={userAddress} contractOwnerAddress={contractOwnerAddress} />} />
                </Routes>
                {showNewUserPopup && isWalletConnected && (
                    <div className="dim-background">
                        <div className="new-user-popup">
                            <button className="close-button" onClick={handleClosePopup}>&times;</button>
                            <p className="claim-points-text">Claim your 5 Loyalty Points now!</p>
                            <div className="social-buttons-container">
                                <button className="social-button" onClick={() => setButtonOneClicked(true)}>
                                    {buttonOneClicked ? "Connected" : <><span>Connect</span><img src={twitter} alt="Twitter" /></>}
                                </button>
                                <button className="social-button" onClick={() => setButtonTwoClicked(true)}>
                                    {buttonTwoClicked ? "Connected" : <><span>Connect</span><img src={discord} alt="Discord" /></>}
                                </button>
                            </div>
                            <button className="claim-button" onClick={handleNewUserAward}>Claim Points</button>
                        </div>
                    </div>
                )}
                {showMixedPaymentPopup && (
                    <div className="mixed-payment-popup">
                        <input type="number" placeholder="Enter Loyalty Token Amount" value={loyaltyTokenAmountForMixedPayment} onChange={(e) => setLoyaltyTokenAmountForMixedPayment(e.target.value)} />
                        <button onClick={handleConfirmMixedPayment}>Confirm Mixed Payment</button>
                        <button onClick={() => setShowMixedPaymentPopup(false)}>Close</button>
                    </div>
                )}
            </div>
        </Router>
    );
                }    
export default App;
