import React from 'react';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { NavBar } from '../../components/layout/NavBar';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();

    const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <ShoppingCart className="mr-3 w-8 h-8" />
                    Keranjang Belanja
                </h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500 text-lg mb-4">Keranjang Anda kosong</p>
                        <button
                            onClick={() => navigate('/home')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                                            <p className="text-gray-500 text-sm">{item.description}</p>
                                            <p className="text-blue-600 font-medium mt-1">
                                                {item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : 'Harga Hubungi Admin'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-100 rounded-l-lg"
                                            >
                                                <Minus className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <span className="px-4 py-2 font-medium text-gray-700">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-100 rounded-r-lg"
                                            >
                                                <Plus className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-24">
                            <h2 className="text-xl font-semibold mb-4">Ringkasan Belanja</h2>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Item</span>
                                    <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 pt-4 border-t">
                                    <span>Total Harga</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    alert('Fitur Checkout akan segera hadir!');
                                    // navigate('/checkout');
                                }}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                Checkout
                            </button>
                            <button
                                onClick={clearCart}
                                className="w-full mt-3 text-red-600 py-2 text-sm hover:underline"
                            >
                                Kosongkan Keranjang
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
