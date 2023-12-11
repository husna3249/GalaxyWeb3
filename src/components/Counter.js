import React from 'react';
import CountUp from 'react-countup';

export const Counter = ({ end, duration }) => {
    return (
        <CountUp end={end} duration={duration} />
    );
};
