import { useMemo } from 'react';

const data = [
  {
    id: 1,
    category: 'Lingkungan Kerja',
    items: [
      { id: 1, parameter: 'Kebisingan', jumlah: 4, biaya: 600000 },
      { id: 2, parameter: 'Penerangan', jumlah: 4, biaya: 600000 },
    ],
  },
  {
    id: 2,
    category: 'Keselamatan Kerja',
    items: [
      { id: 3, parameter: 'Bejana tekan', jumlah: 4, biaya: 600000 },
      { id: 4, parameter: 'Pembumian', jumlah: 4, biaya: 600000 },
    ],
  },
  {
    id: 3,
    category: 'Kesehatan Kerja',
    items: [
      { id: 5, parameter: 'Kebisingan', jumlah: 4, biaya: 600000 },
      { id: 6, parameter: 'Kebisingan', jumlah: 4, biaya: 600000 },
    ],
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

const CostPanel = () => {
  const totalCost = useMemo(() => {
    return data.reduce((total, category) => {
      return total + category.items.reduce((categoryTotal, item) => {
        return categoryTotal + (item.jumlah * item.biaya);
      }, 0);
    }, 0);
  }, []);

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">🛒 Resume</h3>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
        {/* Header Tabel */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-300 text-gray-700 font-bold text-lg">
          <div className="col-span-6">Parameter</div>
          <div className="col-span-3 text-right">Jumlah</div>
          <div className="col-span-3 text-right">Biaya</div>
        </div>

        {/* Konten Rincian Biaya */}
        <div className="p-6 space-y-4">
          {data.map((categoryData) => (
            <div key={categoryData.id} className="space-y-2">
              {/* Kategori Utama */}
              <div className="flex items-center text-blue-600 font-semibold mb-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                <span className="text-base text-gray-800">{categoryData.category}</span>
              </div>

              {/* Item dalam Kategori */}
              <div className="space-y-1 pl-4">
                {categoryData.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 text-sm text-gray-700">
                    <div className="col-span-6">{item.parameter}</div>
                    <div className="col-span-3 text-right">{item.jumlah}</div>
                    <div className="col-span-3 text-right">Rp {formatCurrency(item.biaya)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total Biaya */}
        <div className="p-6 border-t border-gray-300 mt-4 flex justify-between items-center">
          <span className="text-xl font-extrabold">TOTAL</span>
          <div className="px-4 py-2 bg-blue-50 text-gray-700 rounded-md text-xl font-bold">
            Rp {formatCurrency(totalCost)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostPanel;