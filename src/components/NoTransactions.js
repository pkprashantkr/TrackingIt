import React from "react";
import transactions from "../assets/transactions.svg";
function NoTransactions() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flexDirection: "column",
        marginBottom: "2rem",
      }}
    >
      <img
        src={transactions}
        style={{
          width: "100%", // Default width
          maxWidth: "400px", // Maximum width of the image
          height: "auto", // Maintain aspect ratio
          margin: "4rem",
        }}
      />
      <p style={{ textAlign: "center", fontSize: "1.2rem" }}>
        You Have No Transactions Currently
      </p>
    </div>
  );
}

export default NoTransactions;
