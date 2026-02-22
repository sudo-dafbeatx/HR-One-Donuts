import React from "react";
import styled from "styled-components";

const Pattern = () => {
  return <Container />;
};

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  opacity: 0.7;
  z-index: 0;
  pointer-events: none;
`;

export default Pattern;
