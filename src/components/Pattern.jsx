import React from "react";
import styled from "styled-components";

const Pattern = () => {
  return (
    <Wrapper>
      <div className="container">
        <div id="stars" />
        <div id="stars2" />
        <div id="stars3" />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  .container {
    height: 100%;
    width: 100%;
    background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
    overflow: hidden;
  }

  #stars, #stars2, #stars3 {
    position: absolute;
    background: transparent;
  }

  #stars {
    width: 1px;
    height: 1px;
    box-shadow:
      100px 200px #fff,
      400px 800px #fff,
      900px 1200px #fff,
      1300px 400px #fff,
      1600px 900px #fff;
    animation: animStar 50s linear infinite;
  }

  #stars2 {
    width: 2px;
    height: 2px;
    box-shadow:
      300px 600px #fff,
      800px 300px #fff,
      1500px 1000px #fff,
      1800px 700px #fff;
    animation: animStar 100s linear infinite;
  }

  #stars3 {
    width: 3px;
    height: 3px;
    box-shadow:
      500px 500px #fff,
      1200px 1500px #fff,
      1700px 200px #fff;
    animation: animStar 150s linear infinite;
  }

  @media (max-width: 768px) {
    #stars2,
    #stars3 {
      display: none;
    }
  }

  @keyframes animStar {
    from { transform: translateY(0px); }
    to { transform: translateY(-2000px); }
  }
`;

export default Pattern;
