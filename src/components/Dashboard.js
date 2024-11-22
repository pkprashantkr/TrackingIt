import React, { useEffect, useState } from "react";
import { Button, Card, Input, message, Row } from "antd";
import { Line, Pie } from "@ant-design/charts";
import moment from "moment";
import TransactionSearch from "./TransactionSearch";
import Header from "./Header";
import AddIncomeModal from "./Modals/AddIncome";
import AddExpenseModal from "./Modals/AddExpense";
import ResetBalanceButton from "../components/Modals/ResetBalanceButton";
import Cards from "./Cards";
import NoTransactions from "./NoTransactions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { unparse } from "papaparse";
import "../App.css";
import axios from "axios";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);

  // States for chart data
  const [balanceData, setBalanceData] = useState([]);
  const [spendingDataArray, setSpendingDataArray] = useState([]);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const addTransaction = async (transaction) => {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      toast.success("Transaction added successfully!");
      console.log("Transaction written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding transaction: ", error);
      toast.error("Failed to add transaction.");
    }
  };

  // Function to calculate chart data
  const processChartData = () => {
    const newBalanceData = [];
    const newSpendingData = {};

    transactions.forEach((transaction) => {
      const monthYear = moment(transaction.date).format("MMM YYYY");
      const tag = transaction.tag;

      if (transaction.type === "income") {
        if (newBalanceData.some((data) => data.month === monthYear)) {
          newBalanceData.find((data) => data.month === monthYear).balance +=
            transaction.amount;
        } else {
          newBalanceData.push({
            month: monthYear,
            balance: transaction.amount,
          });
        }
      } else {
        if (newBalanceData.some((data) => data.month === monthYear)) {
          newBalanceData.find((data) => data.month === monthYear).balance -=
            transaction.amount;
        } else {
          newBalanceData.push({
            month: monthYear,
            balance: -transaction.amount,
          });
        }

        if (newSpendingData[tag]) {
          newSpendingData[tag] += transaction.amount;
        } else {
          newSpendingData[tag] = transaction.amount;
        }
      }
    });

    const newSpendingDataArray = Object.keys(newSpendingData).map((key) => ({
      category: key,
      value: newSpendingData[key],
    }));

    // Update state
    setBalanceData(newBalanceData);
    setSpendingDataArray(newSpendingDataArray);
  };

  useEffect(() => {
    processChartData(); // Recalculate chart data whenever transactions change
  }, [transactions]);

  const showExpenseModal = () => {
    setIsExpenseModalVisible(true);
  };

  const showIncomeModal = () => {
    setIsIncomeModalVisible(true);
  };

  const handleExpenseCancel = () => {
    setIsExpenseModalVisible(false);
  };

  const handleIncomeCancel = () => {
    setIsIncomeModalVisible(false);
  };

  const onFinish = (values, type) => {
    const newTransaction = {
      type: type,
      date: moment(values.date).format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setTransactions([...transactions, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    addTransaction(newTransaction);
    calculateBalance();
  };

  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        incomeTotal += transaction.amount;
      } else {
        expensesTotal += transaction.amount;
      }
    });

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  // Calculate the initial balance, income, and expenses
  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${user.uid}/transactions`)
      );

      const transaction = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(transaction);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const balanceConfig = {
    data: balanceData,
    xField: "month",
    yField: "balance",
  };

  const spendingConfig = {
    data: spendingDataArray,
    angleField: "value",
    colorField: "category",
  };

  const cardStyle = {
    boxShadow: "0px 0px 30px 8px rgba(227, 227, 227, 0.75)",
    margin: "1.5rem",
    marginTop: "2rem",
    borderRadius: "0.5rem",
    minWidth: "400px",
    flex: 1,
  };

  function exportToCsv() {
    const csv = unparse(transactions, {
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url =
      "https://script.google.com/macros/s/AKfycby4ZZZ0RjsjBz6GmQfJ58hdOgrK91QkdjhnqsQLBY7o_YLnyjkXV0CgD0xZQWaumMB4/exec";

    try {
      const response = await axios.post(
        url,
        JSON.stringify({ ...formData, action: "addContactDetails" }),
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      console.log(response);
      if (response.status === 200) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "", phone: "" });
        toast.success("Feedback submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.success("success.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cards
            income={income}
            expenses={expenses}
            currentBalance={currentBalance}
            showExpenseModal={showExpenseModal}
            showIncomeModal={showIncomeModal}
            cardStyle={cardStyle}
            reset={
              <ResetBalanceButton
                setIncome={setIncome}
                setExpense={setExpenses}
                setTotalBalance={setCurrentBalance}
              />
            }
          />

          <AddExpenseModal
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />
          <AddIncomeModal
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />
          {transactions.length === 0 ? <NoTransactions /> : <></>}
          <TransactionSearch
            transactions={transactions}
            exportToCsv={exportToCsv}
            fetchTransactions={fetchTransactions}
            addTransaction={addTransaction}
            user={user}
          />
          <footer>
            <div className="footer">
              <h1>Send us your feedback...!</h1>
              <div>
                <form onSubmit={(e) => handleSubmit(e)}>
                  <Input
                    className="footer-input"
                    placeholder="Your name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    className="footer-input"
                    placeholder="Your email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    className="footer-input"
                    placeholder="Your phone number"
                    type="number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    className="footer-input"
                    placeholder="Your message"
                    type="text"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                  <button className="submit" type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </form>
                {submitted && <p>Thank you for your feedback!</p>}
              </div>
            </div>
          </footer>
          <p
            style={{
              textAlign: "center",
              color: "#ababab",
              backgroundColor: "#ededed",
              padding: "1.7rem",
              fontSize: "1rem",
            }}
            className="copyright"
          >
            &#169; Prashant Kumar. All rights are reserved.
          </p>
        </>
      )}
    </div>
  );
};

export default Dashboard;
