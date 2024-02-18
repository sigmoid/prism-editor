import React from 'react';
import './LinkButton.css';

const LinkButton = ({ children, ...props }) => {
  const { onClick } = props;


  return (
    <button className="link-button ms-2" onClick={onClick}>
      {children}
    </button>
  );
};

export default LinkButton;