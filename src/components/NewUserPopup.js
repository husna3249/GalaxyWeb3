import React from 'react';

const NewUserPopup = ({ isShown, onButtonOneClick, onButtonTwoClick, onClaimPoints, buttonOneClicked, buttonTwoClicked }) => {
    if (!isShown) return null;

    return (
        <div className="new-user-popup">
            <button onClick={onButtonOneClick}>
                {buttonOneClicked ? "Connected" : "Connect"}
            </button>
            <button onClick={onButtonTwoClick}>
                {buttonTwoClicked ? "Connected" : "Connect"}
            </button>
            <button onClick={onClaimPoints}>Claim Points</button>
        </div>
    );
};

export default NewUserPopup;
