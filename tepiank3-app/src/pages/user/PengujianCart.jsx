import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

const PengujianCart = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    setTotal(newTotal);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Keranjang kosong</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Keranjang Pengujian ({items.length})
        </h3>
      </div>

      {/* Items */}
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">{item.jenisPengujian}</p>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center border border-gray-300 rounded py-1"
                  min="1"
                />
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">Rp {item.price?.toLocaleString('id-ID') || 0}</p>
                <p className="font-semibold text-blue-600">Rp {item.subtotal?.toLocaleString('id-ID') || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-800">Total:</span>
          <span className="text-2xl font-bold text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
        </div>

        <button
          onClick={onClearCart}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm"
        >
          Kosongkan Keranjang
        </button>
      </div>
    </div>
  );
};

export default PengujianCart;