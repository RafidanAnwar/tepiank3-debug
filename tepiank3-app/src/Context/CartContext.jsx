import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isRevisionMode, setIsRevisionMode] = useState(false);

    useEffect(() => {
        // Don't save cart to localStorage when in revision mode
        if (!isRevisionMode) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isRevisionMode]);

    // Clear cart when entering revision mode
    useEffect(() => {
        if (isRevisionMode) {
            setCartItems([]);
        }
    }, [isRevisionMode]);

    const addToCart = (item) => {
        // Prevent adding to cart in revision mode
        if (isRevisionMode) {
            console.warn('Cannot add to cart in revision mode');
            return;
        }

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id);
            if (existingItem) {
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        if (isRevisionMode) return;
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (isRevisionMode) return;
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = isRevisionMode ? 0 : cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                setCartItems,
                isRevisionMode,
                setIsRevisionMode,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
