"use client";

import React, { useEffect, useState } from "react";
import "./CheckoutAnimation.css";

export default function CheckoutAnimation() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Start animation slightly after mount for smooth entry
    const timer = setTimeout(() => setIsActive(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`checkout-anim-container ${isActive ? "is-active" : ""}`}>
      <div className="left-side">
        <div className="card">
          <div className="card-line"></div>
          <div className="buttons"></div>
        </div>
        <div className="post">
          <div className="post-line"></div>
          <div className="screen">
            <div className="dollar">$</div>
          </div>
          <div className="numbers"></div>
          <div className="numbers-line2"></div>
        </div>
      </div>
      <div className="right-side">
        <div className="new">Checkout</div>
      </div>
    </div>
  );
}
