import React, { useRef, useState } from "react";
import "../App.css";
import { Input, Table, Select, Radio, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import search from "../assets/search.svg";
import { parse } from "papaparse";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase"; // Ensure Firebase is correctly initialized

const { Option } = Select;

const TransactionSearch = ({
  transactions,
  exportToCsv,
  addTransaction,
  fetchTransactions,
  user,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const fileInput = useRef();

  // Function to remove transaction from Firestore
  const handleRemoveTransaction = async (transactionId) => {
    if (!user || !user.uid) {
      toast.error("User is not authenticated.");
      console.error("User is not authenticated.");
      return;
    }
    if (!transactionId) {
      toast.error("Transaction ID is missing!");
      console.error("Transaction ID is missing!");
      return;
    }
    try {
      // Correct Firestore path to the transaction document
      await deleteDoc(doc(db, `users/${user.uid}/transactions`, transactionId));
      toast.success("Transaction removed successfully!");
      fetchTransactions(); // Refresh the list of transactions
    } catch (error) {
      toast.error("Failed to remove transaction.");
      console.error("Error removing transaction: ", error);
    }
  };

  // Function to import transactions from CSV
  function importFromCsv(event) {
    event.preventDefault();
    try {
      parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          // Now results.data is an array of objects representing your CSV rows
          for (const transaction of results.data) {
            // Write each transaction to Firebase, you can use the addTransaction function here
            console.log("Transactions", transaction);
            const newTransaction = {
              ...transaction,
              amount: parseInt(transaction.amount),
            };
            await addTransaction(newTransaction, true);
          }
        },
      });
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.files = null;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          danger
          onClick={() => handleRemoveTransaction(record.key)} // Use transaction key (ID) for removal
        >
          Remove
        </Button>
      ),
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = searchTerm
      ? transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;

    return searchMatch && tagMatch && typeMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0;
    }
  });

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: transaction.id || index, // Ensure unique key for Firebase documents
    ...transaction,
  }));

  return (
    <div
      style={{
        width: "100%",
        padding: "0rem 2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div className="input-flex">
          <img src={search} width="16" />
          <input
            placeholder="Search by Name"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          className="select-input"
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter}
          placeholder="Filter"
          allowClear
        >
          <Option value="">All</Option>
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>
      </div>

      <div className="my-table">
        <div className="table-header">
          <h2>My Transactions</h2>

          <div className="sort">
            <Radio.Group
              className="input-radio"
              onChange={(e) => setSortKey(e.target.value)}
              value={sortKey}
            >
              <Radio.Button value="">No Sort</Radio.Button>
              <Radio.Button value="date">By Date</Radio.Button>
              <Radio.Button value="amount">By Amount</Radio.Button>
            </Radio.Group>
          </div>

          <div className="import-export-buttons">
            <button className="btn btn-export" onClick={exportToCsv}>
              Export to CSV
            </button>
            <label htmlFor="file-csv" className="btn btn-blue">
              Import from CSV
            </label>
            <input
              onChange={importFromCsv}
              id="file-csv"
              type="file"
              accept=".csv"
              required
              style={{ display: "none" }}
            />
          </div>
        </div>
        <div className="table-container">
          <Table columns={columns} dataSource={dataSource} />
        </div>
      </div>
    </div>
  );
};

export default TransactionSearch;
