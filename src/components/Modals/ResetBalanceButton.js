import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { toast } from "react-toastify";
import { Modal } from "antd"; // Import the Modal component from antd

function ResetBalanceButton({ setIncome, setExpense, setTotalBalance }) {
  const [user] = useAuthState(auth);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  // Function to show the modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Function to handle the OK button (balance reset)
  const handleOk = async () => {
    if (!user) return;

    try {
      const transactionsRef = collection(db, `users/${user.uid}/transactions`);
      const querySnapshot = await getDocs(transactionsRef);

      if (querySnapshot.empty) {
        toast.error("No transactions found to reset.");
        return;
      }

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Reset state variables to 0
      setIncome(0);
      setExpense(0);
      setTotalBalance(0);

      toast.success("Balance reset to 0!");
      setIsModalVisible(false); // Close the modal after success
    } catch (error) {
      console.error("Error resetting balance: ", error);
      toast.error("Failed to reset balance");
      setIsModalVisible(false); // Close the modal even if there's an error
    }
  };

  // Function to handle the Cancel button (close modal without action)
  const handleCancel = () => {
    setIsModalVisible(false); // Close the modal
  };

  return (
    <>
      {/* Reset Balance button */}
      <button className="btn btn-red" onClick={showModal}>
        Reset Balance
      </button>

      {/* Ant Design Modal for confirmation */}
      <Modal
        title="Confirm Reset"
        visible={isModalVisible} // Modal visibility is controlled by state
        onOk={handleOk} // Handle the Ok button click
        onCancel={handleCancel} // Handle the Cancel button click
        okText="Yes" // Ok button text
        cancelText="No" // Cancel button text
        okButtonProps={{
          style: {
            backgroundColor: "#ff4d4f",
            borderColor: "#ff4d4f",
            color: "white",
          }, // Custom color for "Yes" button
        }}
      >
        {/* Modal content */}
        <p>
          Are you sure you want to reset the balance? This will delete all
          transactions.
        </p>
      </Modal>
    </>
  );
}

export default ResetBalanceButton;
