import React from 'react';
import './LandingPage.css';
const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStartedClick = () => {
        navigate('/home'); // Navigate to the main content
    };

    return (
        <div className="landing-page">
            <h1>Welcome to Tesco Club</h1>
            <button onClick={handleGetStartedClick}>Get Started</button>
        </div>
    );
};
export default LandingPage;
