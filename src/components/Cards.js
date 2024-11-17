import React from "react";
import { Card, Row } from "antd";
import ResetBalanceButton from "./Modals/ResetBalanceButton";

function Cards({
  currentBalance,
  income,
  expenses,
  showExpenseModal,
  showIncomeModal,
  cardStyle,
  reset, // Accept reset as a prop
}) {
  return (
    <Row
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "space-between",
      }}
    >
      <Card bordered={true} style={cardStyle}>
        <h2>Current Balance</h2>
        <p style={{ fontSize: "1.1rem" }}>₹{currentBalance}</p>
        <div>
          {reset} {/* Use the reset prop here */}
        </div>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Total Income</h2>
        <p style={{ fontSize: "1.1rem" }}>₹{income}</p>
        <div
          className="btn btn-blue"
          style={{ margin: 0 }}
          onClick={showIncomeModal}
        >
          Add Income
        </div>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Total Expenses</h2>
        <p style={{ fontSize: "1.1rem" }}>₹{expenses}</p>
        <div className="btn btn-blue" onClick={showExpenseModal}>
          Add Expense
        </div>
      </Card>
    </Row>
  );
}

export default Cards;
