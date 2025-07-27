import React, { useState, useMemo } from 'react';

const BillingPage = ({ user, onSignOut }) => {
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
        if (grandTotal === 0) {
            alert("Cart is empty.");
            return;
        }
        if (vpaId.trim() === '') {
            alert("Please enter your UPI VPA ID.");
            return;
        }
        alert(`Initiating payment for $${grandTotal.toFixed(2)} to VPA: ${vpaId}`);
    };

    return (
        <div className="font-sans bg-gray-100 flex justify-center items-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                    <button className="text-2xl">&larr;</button>
                    <h1 className="text-lg font-semibold">Final Billing</h1>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm hidden sm:block">{user.username || user.email}</span>
                        <button onClick={onSignOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full text-xs">
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Product List */}
                    <div id="product-list" className="mb-4">
                        {cartItems.map(item => (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200" key={item.id}>
                                <span className="text-gray-700">{item.name}</span>
                                <span className="font-medium text-gray-800">${item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grand Total */}
                    <div className="flex justify-between items-center py-3 font-bold text-lg border-t-2 border-gray-300 mt-4">
                        <span className="text-gray-800">Grand Total</span>
                        <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
                    </div>

                    {/* Payment Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-600 mb-3">Select Payment Method</h3>
                        <div className="border-2 border-indigo-500 rounded-lg p-4 bg-indigo-50 shadow-sm">
                            <div className="flex items-center">
                                <div className="text-indigo-600 font-bold mr-4">QR / VPA</div>
                                <div>
                                    <div className="font-semibold text-gray-800">Online Payment (QR / UPI VPA)</div>
                                    <div className="text-sm text-gray-500">Scan QR or enter VPA ID</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="vpa-id" className="block text-sm font-medium text-gray-700 mb-1">Enter UPI VPA ID:</label>
                                <input
                                    type="text"
                                    id="vpa-id"
                                    value={vpaId}
                                    onChange={(e) => setVpaId(e.target.value)}
                                    placeholder="yourname@bank"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <span className="text-xl mr-3">💬</span>
                            <div>
                                <div className="font-semibold text-gray-800">Please Re-Scan The Iteam For Removal</div>
                                <div className="text-sm text-gray-500">In Case Any Error Please Visit Nearest Help Desk </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Button */}
                <div className="p-6 bg-white border-t border-gray-200">
                    <button onClick={handleConfirmAndPay} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
