import React from 'react';
import { ThreeDots } from 'react-loader-spinner'; // Make sure this is installed

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
      <ThreeDots
        visible={true}
        height="80"
        width="80"
        color="#4fa94d"
        radius="9"
        ariaLabel="three-dots-loading"
      />
    </div>
  );
}

export default Loader;
