import React, { useState, useMemo } from 'react';
import './BillingPage.css';

const BillingPage = () => {
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Ground Nut Oil", price: 7.23 },
        { id: 2, name: "Totala 12 Paste", price: 4.10 },
        { id: 3, name: "Soap", price: 5.10 },
        { id: 4, name: "Bleach Powder", price: 7.10 },
        { id: 5, name: "Salt", price: 6.00 }
    ]);

    const [vpaId, setVpaId] = useState('');

    const grandTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.price, 0);
    }, [cartItems]);

    const handleConfirmAndPay = () => {
        if (grandTotal === 0 || cartItems.length === 0) {
            alert("Cart is empty. Please add products to proceed.");
            return;
        }

        if (vpaId.trim() === '') {
            alert("Please enter your UPI VPA ID for online payment.");
            return;
        }

        alert(`Initiating online payment for $${grandTotal.toFixed(2)} to VPA: ${vpaId}`);
        console.log("Payment details:", {
            total: grandTotal,
            vpa: vpaId,
            cart: cartItems
        });
    };

    return (
        <div className="container">
            <div className="header">
                <span className="back-arrow">&#8592;</span>
                <div className="title">Final Billing</div>
                <span className="profile-icon">&#128100;</span>
            </div>

            <div className="content">
                <div id="product-list">
                    {cartItems.map(item => (
                        <div className="product-item" key={item.id}>
                            <span className="name">{item.name}</span>
                            <span className="price">${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="total-row grand-total">
                    <span className="label">Grand Total</span>
                    <span className="value">${grandTotal.toFixed(2)}</span>
                </div>

                <div className="payment-section">
                    <h3>Select Payment Method</h3>
                    <div className="payment-option selected">
                        <div className="icon">QR / VPA</div>
                        <div className="details">
                            <div className="title">Online Payment (QR / UPI VPA)</div>
                            <div className="description">Scan QR or enter VPA ID</div>
                        </div>
                    </div>

                    <div className="vpa-input-group">
                        <label htmlFor="vpa-id">Enter UPI VPA ID:</label>
                        <input
                            type="text"
                            id="vpa-id"
                            value={vpaId}
                            onChange={(e) => setVpaId(e.target.value)}
                            placeholder="yourname@bankname"
                        />
                    </div>
                </div>

                <div className="feedback-section">
                    <div className="prompt">
                        <span className="icon">&#128172;</span>
                        <span className="text">Caught Feedback?</span>
                    </div>
                    <div className="message">Share your thoughts about your cart</div>
                </div>
            </div>

            <div className="confirm-button-wrapper">
                <button className="confirm-button" onClick={handleConfirmAndPay}>
                    Confirm & Pay
                </button>
            </div>
        </div>
    );
};

export default BillingPage;