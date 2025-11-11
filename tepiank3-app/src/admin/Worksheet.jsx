// File: ParameterTable.jsx
import React, {useState} from "react";
import {
    Check,
    MessageSquare,
    Printer,
    Save,
    ChevronLeft,
    ChevronRight,
    ClipboardList
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import Navbar from "../pages/NavBar.jsx";

const ParameterTable = () => {
    const navigate = useNavigate();
    // ========================= DATA PERUSAHAAN & CLUSTER =========================
    const companies = [
        {
            id: 1,
            name: "PT. Antareja Mahada Makmur",
            site: "Site MHU",
            address: "Desa Jembayan, Kecamatan Loa Duri, Kota Samarinda, Prov. Kalimantan Timur",
            contactPerson: "Muttaqin",
            phone: "0812 8769 0967",
            email: "muttaqin@amm.id",
            clusters: [
                {
                    clusterName: "Lingkungan Kerja",
                    tests: [
                        {
                            jenisPengujian: "Faktor Fisik",
                            items: [
                                {
                                    param: "Kebisingan",
                                    jumlah: 20,
                                    acuan: "Permenaker 05/2018",
                                    peralatan: "Sound Level Meter",
                                    jumlahPeralatan: 1
                                }, {
                                    param: "Iklim Kerja",
                                    jumlah: 5,
                                    acuan: "Permenaker 05/2018",
                                    peralatan: "Heat Stress Monitor",
                                    jumlahPeralatan: 1
                                }
                            ]
                        }, {
                            jenisPengujian: "Faktor Kimia",
                            items: [
                                {
                                    param: "Debu Total",
                                    jumlah: 10,
                                    acuan: "Permenaker 05/2018",
                                    peralatan: "Personal Dust Sampler",
                                    jumlahPeralatan: 1
                                }, {
                                    param: "Gas CO",
                                    jumlah: 5,
                                    acuan: "Permenaker 05/2018",
                                    peralatan: "CO Gas Detector",
                                    jumlahPeralatan: 1
                                }
                            ]
                        }
                    ]
                }, {
                    clusterName: "Lingkungan Hidup",
                    tests: [
                        {
                            jenisPengujian: "Udara Ambien",
                            items: [
                                {
                                    param: "SO₂",
                                    jumlah: 3,
                                    acuan: "PP 22/2021",
                                    peralatan: "Impinger",
                                    jumlahPeralatan: 1
                                }, {
                                    param: "NO₂",
                                    jumlah: 3,
                                    acuan: "PP 22/2021",
                                    peralatan: "Impinger",
                                    jumlahPeralatan: 1
                                }
                            ]
                        }, {
                            jenisPengujian: "Air Limbah",
                            items: [
                                {
                                    param: "BOD",
                                    jumlah: 2,
                                    acuan: "PP 22/2021",
                                    peralatan: "Botol Sampling",
                                    jumlahPeralatan: 1
                                }, {
                                    param: "COD",
                                    jumlah: 2,
                                    acuan: "PP 22/2021",
                                    peralatan: "Botol Sampling",
                                    jumlahPeralatan: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        }, {
            id: 2,
            name: "PT. Bara Sejahtera Mandiri",
            site: "Site BSM",
            address: "Jl. Poros Tenggarong KM.15, Kutai Kartanegara, Kalimantan Timur",
            contactPerson: "Dewi Lestari",
            phone: "0813 5567 9902",
            email: "dewi@bsm.id",
            clusters: [
                {
                    clusterName: "Lingkungan Kerja",
                    tests: [
                        {
                            jenisPengujian: "Faktor Fisik",
                            items: [
                                {
                                    param: "Kebisingan Personal",
                                    jumlah: 15,
                                    acuan: "Permenaker 05/2018",
                                    peralatan: "Noise Dosimeter",
                                    jumlahPeralatan: 2
                                }, {
                                    param: "Penerangan",
                                    jumlah: 20,
                                    acuan: "Permenaker 05/2018",
                                    peralatan: "Lux Meter",
                                    jumlahPeralatan: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    const [companyIndex, setCompanyIndex] = useState(0);
    const [statuses, setStatuses] = useState({});
    const currentCompany = companies[companyIndex];

    // ========================= HANDLER =========================
    const handlePrevCompany = () => {
        setCompanyIndex((prev) => (
            prev > 0
                ? prev - 1
                : companies.length - 1
        ));
        setStatuses({});
    };

    const handleNextCompany = () => {
        setCompanyIndex((prev) => (
            prev < companies.length - 1
                ? prev + 1
                : 0
        ));
        setStatuses({});
    };

    const handleStatusToggle = (paramName, type) => {
        setStatuses((prev) => ({
            ...prev,
            [paramName]: type === "siap"
                ? {
                    siap: true,
                    tidak: false
                }
                : {
                    siap: false,
                    tidak: true
                }
        }));
    };

    const handleSubmit = () => {
        const allParams = currentCompany
            .clusters
            .flatMap(
                (cluster) => cluster.tests.flatMap((test) => test.items.map((i) => i.param))
            );

        const allFilled = allParams.every(
            (p) => statuses[p] && (statuses[p].siap || statuses[p].tidak)
        );

        if (!allFilled) {
            alert("⚠️ Harap isi semua kolom Siap/Tidak sebelum submit!");
            return;
        }

        alert("✅ Data berhasil disubmit!");

        // Reset checklist ke awal
        setStatuses({});
    };

    // ========================= RENDER UI =========================
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            {/* BODY */}
            <div className="flex">
                {/* SIDEBAR */}
                <div className="flex min-h-screen">
                    <aside
                        className="w-72 bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 p-5 border-r border-gray-200">
                        <div className="bg-white rounded-2xl shadow p-5">
                            <div className="flex justify-center mb-4">
                                <div
                                    className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl">
                                    👤
                                </div>
                            </div>

                            <h3 className="text-center font-bold text-gray-800 text-sm">
                                {currentCompany.name}
                            </h3>
                            <p className="text-center text-xs text-blue-600">
                                {currentCompany.site}
                            </p>

                            <p className="mt-3 text-xs text-gray-600">Alamat:</p>
                            <p className="text-xs text-gray-700">{currentCompany.address}</p>

                            <div className="mt-3">
                                <p className="text-xs text-gray-600 font-medium">
                                    Kontak Person:
                                </p>
                                <p className="text-xs font-semibold text-gray-800">
                                    {currentCompany.contactPerson}
                                </p>
                                <p className="text-xs text-blue-600">{currentCompany.phone}</p>
                                <p className="text-xs text-blue-600">{currentCompany.email}</p>
                            </div>

                            {/* pemilihan jenis parameter */}
                            {/* <div className="mt-6 space-y-2">   */}
                            {/* Parameter */}
                            {/* <button className="w-full flex items-center justify-start space-x-3 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition">
                                      <img className="w-5 h-5" src="./logo_parameter.png" alt="logo parameter" />
                                      <span>Parameter</span>
                                </button> */
                            }
                            {/* Jadwal & Personel */}
                            {/* <button className="w-full flex items-center justify-start space-x-3 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-100 transition">
                                  <img className="w-5 h-5" src="./logo-jadwal-personel.svg" alt="logo jadwal dan personel" />
                                  <span>Jadwal &amp; Personel</span>
                                </button> */
                            }
                            {/* Detail Transaksi */}
                            {/* <button className="w-full flex items-center justify-start space-x-3 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-100 transition">
                                  <img className="w-5 h-5" src="./logo-transaksi.svg" alt="logo detail transaksi" />
                                  <span>Detail Transaksi</span>
                                </button>
                              </div> */
                            }

                            {/* TOMBOL GANTI PERUSAHAAN */}
                            <div className="flex justify-center mt-4 space-x-2">
                                <button
                                    onClick={handlePrevCompany}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full">
                                    <ChevronLeft className="w-4 h-4"/>
                                </button>
                                <button
                                    onClick={handleNextCompany}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full">
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-6">
                    <h2
                        className="text-xl font-bold text-blue-600 mb-4 flex items-center space-x-2">
                        <span ><ClipboardList className="w-10 h-10"/></span>
                        <span>Rincian Parameter</span>
                    </h2>

                    <div className="rounded-lg shadow-lg overflow-hidden">
                        <table className="w-full text-sm border-separate border-spacing-0">
                            <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                <tr>
                                    <th className="px-3 py-2 text-center border-b border-gray-300 rounded-tl-lg">Cluster</th>
                                    <th className="px-3 py-2 border-b border-gray-300">Jenis Pengujian</th>
                                    <th className="px-3 py-2 border-b border-gray-300">Parameter</th>
                                    <th className="px-3 py-2 text-center border-b border-gray-300">Jumlah</th>
                                    <th className="px-3 py-2 border-b border-gray-300">Acuan</th>
                                    <th className="px-3 py-2 border-b border-gray-300">Peralatan</th>
                                    <th className="px-3 py-2 text-center border-b border-gray-300">Jumlah</th>
                                    <th className="px-3 py-2 text-center border-b border-gray-300">Siap</th>
                                    <th className="px-3 py-2 text-center border-b border-gray-300 rounded-tr-lg">Tidak</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {
                                    currentCompany
                                        .clusters
                                        .map((cluster, ci) => {
                                            const clusterRowCount = cluster
                                                .tests
                                                .reduce((sum, test) => sum + test.items.length, 0);

                                            let clusterRowRendered = false;

                                            return cluster
                                                .tests
                                                .map((test, ti) => {
                                                    const testRowCount = test.items.length;
                                                    let testRowRendered = false;

                                                    return test
                                                        .items
                                                        .map((item, ii) => (
                                                            <tr
                                                                key={`${ci}-${ti}-${ii}`}
                                                                className="bg-white hover:bg-gray-50 transition-colors">
                                                                {/* CLUSTER NAME */}
                                                                {
                                                                    !clusterRowRendered && (
                                                                        <td
                                                                            className="px-3 py-2 border-b border-r border-gray-200 text-center align-middle "
                                                                            rowSpan={clusterRowCount}>
                                                                            {cluster.clusterName}
                                                                        </td>
                                                                    )
                                                                }
                                                                {
                                                                    (() => {
                                                                        clusterRowRendered = true;
                                                                        return null;
                                                                    })()
                                                                }

                                                                {/* JENIS PENGUJIAN */}
                                                                {
                                                                    !testRowRendered && (
                                                                        <td
                                                                            className="px-3 py-2 border-b border-r border-gray-200 text-center align-middle"
                                                                            rowSpan={testRowCount}>
                                                                            {test.jenisPengujian}
                                                                        </td>
                                                                    )
                                                                }
                                                                {
                                                                    (() => {
                                                                        testRowRendered = true;
                                                                        return null;
                                                                    })()
                                                                }

                                                                {/* PARAMETER ITEM */}
                                                                <td className="px-3 py-2 border-b border-gray-200">{item.param}</td>
                                                                <td className="px-3 py-2 text-center border-b border-gray-200">
                                                                    {item.jumlah}
                                                                </td>
                                                                <td className="px-3 py-2 border-b border-gray-200">{item.acuan}</td>
                                                                <td className="px-3 py-2 border-b border-gray-200">{item.peralatan}</td>
                                                                <td className="px-3 py-2 text-center border-b border-gray-200">
                                                                    {item.jumlahPeralatan}
                                                                </td>

                                                                {/* STATUS CHECKLIST */}
                                                                <td className="px-3 py-2 text-center border-b border-gray-200">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={statuses[item.param]
                                                                            ?.siap || false}
                                                                        onChange={() => handleStatusToggle(item.param, "siap")}
                                                                        className="w-4 h-4 text-blue-600"/>
                                                                </td>
                                                                <td className="px-3 py-2 text-center border-b border-gray-200">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={statuses[item.param]
                                                                            ?.tidak || false}
                                                                        onChange={() => handleStatusToggle(item.param, "tidak")}
                                                                        className="w-4 h-4 text-red-600"/>
                                                                </td>
                                                            </tr>
                                                        ));
                                                });
                                        })
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="bg-white rounded-lg shadow-xl mt-5 p-4 flex flex-col ">
                        <div className="flex justify-between gap-6 items-stretch">
                            {/* === BAHAN HABIS === */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-600">
                                        <i className="fa-solid fa-flask"></i>
                                    </span>
                                    <h2 className="text-blue-700 font-semibold text-base">Bahan Habis</h2>
                                </div>
                                <div
                                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm text-gray-700 overflow-y-auto max-h-60">
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Parameter SO₂</li>
                                        <li>Parameter O₃</li>
                                        <li>Parameter CO</li>
                                        <li>Parameter NO₂</li>
                                        <li>Parameter H₂S</li>
                                        <li>Parameter SO₂</li>
                                        <li>Parameter O₃</li>
                                        <li>Parameter CO</li>
                                        <li>Parameter NO₂</li>
                                        <li>Parameter H₂S</li>
                                        <li>Parameter SO₂</li>
                                        <li>Parameter O₃</li>
                                        <li>Parameter CO</li>
                                        <li>Parameter NO₂</li>
                                        <li>Parameter H₂S</li>
                                    </ol>
                                </div>
                            </div>

                            {/* === CATATAN + JADWAL === */}
                            <div className="flex-[2] flex flex-col justify-between">
                                {/* CATATAN */}
                                <div className="flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-blue-600">
                                            <i className="fa-solid fa-note-sticky"></i>
                                        </span>
                                        <h2 className="text-blue-700 font-semibold text-base">Catatan</h2>
                                    </div>
                                    <div
                                        className="border border-gray-300 rounded-md p-3 flex-1 overflow-y-auto text-sm text-gray-700 leading-relaxed min-h-[180px]">
                                        <p>
                                            <strong>Kaji Ulang 25/12/23</strong>
                                            : Pastikan penyimpanan charcoal pada coolbox agar kualitas tetap terjaga.
                                        </p>
                                        <p className="mt-2">
                                            <strong>Catatan Tambahan</strong>
                                            : Cek kembali stok bahan sebelum pengambilan sampel berikutnya.
                                        </p>
                                    </div>
                                </div>

                                {/* CARD JADWAL, PERSONEL, TOMBOL */}
                                <div className="flex justify-between items-center p-3 mt-3 gap-4 min-w-0">
                                    {/* JUMLAH HARI & PERSONEL */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {/* Jumlah Hari */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <img className="w-8 h-8 flex-shrink-0" src="./logo-jadwal.svg" alt="logo"/>
                                            <label
                                                className="text-base font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">
                                                Jumlah Hari
                                            </label>
                                            <input
                                                type="number"
                                                defaultValue="10"
                                                className="border rounded px-2 py-1 text-center w-16 flex-shrink-0 text-sm"/>
                                        </div>

                                        {/* Jumlah Personel */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <img
                                                className="w-8 h-8 flex-shrink-0"
                                                src="./logo-jadwal-personel.svg"
                                                alt="logo"/>
                                            <label
                                                className="text-base font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">
                                                Jumlah Personel
                                            </label>
                                            <input
                                                type="number"
                                                defaultValue="6"
                                                className="border rounded px-2 py-1 text-center w-16 flex-shrink-0 text-sm"/>
                                        </div>
                                    </div>

                                    {/* TOMBOL */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Printer
                                            className="w-8 h-8 hover:bg-blue-300 text-blue-600 flex-shrink-0 cursor-pointer"/>
                                        <Save
                                            className="w-8 h-8 hover:bg-blue-300 text-blue-600 flex-shrink-0 cursor-pointer"/>
                                        <button
                                            onClick={handleSubmit}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                                            <Check className="w-4 h-4 flex-shrink-0"/>
                                            <span>SUBMIT</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
            </div>

            {/* Chat */}
            <button
                className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
                <MessageSquare className="w-6 h-6"/>
            </button>
        </div>
    );
};

export default ParameterTable;
