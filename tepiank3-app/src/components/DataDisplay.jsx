import React, { useState, useEffect } from 'react';
import { 
  clusterService, 
  jenisPengujianService, 
  parameterService, 
  orderService 
} from '../services';

const DataDisplay = () => {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [jenisPengujian, setJenisPengujian] = useState([]);
  const [selectedJenisPengujian, setSelectedJenisPengujian] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load clusters saat komponen dimount
  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = async () => {
    try {
      setLoading(true);
      const data = await clusterService.getAllClusters();
      setClusters(data);
    } catch (error) {
      console.error('Error loading clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClusterSelect = async (cluster) => {
    try {
      setSelectedCluster(cluster);
      setLoading(true);
      
      // Load jenis pengujian berdasarkan cluster
      const jenisPengujianData = await jenisPengujianService.getJenisPengujianByCluster(cluster.id);
      setJenisPengujian(jenisPengujianData);
      
      // Reset selections
      setSelectedJenisPengujian(null);
      setParameters([]);
    } catch (error) {
      console.error('Error loading jenis pengujian:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJenisPengujianSelect = async (jenis) => {
    try {
      setSelectedJenisPengujian(jenis);
      setLoading(true);
      
      // Load parameters berdasarkan jenis pengujian
      const parameterData = await parameterService.getParametersByJenisPengujian(jenis.id);
      setParameters(parameterData);
    } catch (error) {
      console.error('Error loading parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (selectedParameters) => {
    try {
      // Ambil data perusahaan dari localStorage
      const companyData = JSON.parse(localStorage.getItem('companyData') || '{}');
      
      const orderData = {
        companyInfo: companyData,
        items: selectedParameters.map(param => ({
          parameterId: param.id,
          quantity: 1,
          price: param.harga
        }))
      };

      const order = await orderService.createOrder(orderData);
      alert('Order berhasil dibuat!');
      console.log('Order created:', order);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Gagal membuat order');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pilih Parameter Pengujian</h1>
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Memuat data...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clusters */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Pilih Cluster</h2>
          <div className="space-y-2">
            {clusters.map(cluster => (
              <button
                key={cluster.id}
                onClick={() => handleClusterSelect(cluster)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedCluster?.id === cluster.id
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{cluster.name}</div>
                {cluster.description && (
                  <div className="text-sm text-gray-600">{cluster.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Jenis Pengujian */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Jenis Pengujian</h2>
          {selectedCluster ? (
            <div className="space-y-2">
              {jenisPengujian.map(jenis => (
                <button
                  key={jenis.id}
                  onClick={() => handleJenisPengujianSelect(jenis)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedJenisPengujian?.id === jenis.id
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{jenis.name}</div>
                  {jenis.description && (
                    <div className="text-sm text-gray-600">{jenis.description}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Pilih cluster terlebih dahulu</p>
          )}
        </div>

        {/* Parameters */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Parameter</h2>
          {selectedJenisPengujian ? (
            <div className="space-y-2">
              {parameters.map(param => (
                <div
                  key={param.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="font-medium">{param.name}</div>
                  <div className="text-sm text-gray-600">
                    Satuan: {param.satuan || '-'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Acuan: {param.acuan || '-'}
                  </div>
                  <div className="text-lg font-bold text-blue-600 mt-2">
                    Rp {Number(param.harga).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
              
              {parameters.length > 0 && (
                <button
                  onClick={() => handleCreateOrder(parameters)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buat Pengajuan
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Pilih jenis pengujian terlebih dahulu</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;