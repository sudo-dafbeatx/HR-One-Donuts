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
  background-image: radial-gradient(#e2e8f0 2px, transparent 2px);
  background-size: 32px 32px;
  opacity: 0.8;
  z-index: 0;
  pointer-events: none;
`;

export default Pattern;
