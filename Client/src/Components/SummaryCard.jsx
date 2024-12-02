import React from "react";

const SummaryCard = ({ icon, text, number, color }) => {
  return (
    <div className={`card shadow-sm p-4 ${color} text-white`}>
      <div className="d-flex align-items-center">
        <div className="icon me-3" style={{ fontSize: '2rem' }}>
          {icon}
        </div>
        <div>
          {/* Text with Bold and Highlighted Style */}
          <div className="text" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
            {text}
          </div>
          {/* Number with Larger Font, Bold, and Highlighted Style */}
          <div 
            className="number" 
            style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#fff', 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' 
            }}
          >
            {number}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;