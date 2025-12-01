// Data Dummy untuk Pegawai (Personalisasi)
export const dummyPegawai = [
    {
        id: 1,
        nama: "Budi Santoso",
        jabatan: "Kepala Laboratorium",
        status: "SIAP",
        createdAt: "2024-11-15T08:00:00Z",
        updatedAt: "2024-11-20T14:30:00Z"
    },
    {
        id: 2,
        nama: "Siti Nurhaliza",
        jabatan: "Analis Senior",
        status: "SIAP",
        createdAt: "2024-11-15T08:15:00Z",
        updatedAt: "2024-11-20T10:00:00Z"
    },
    {
        id: 3,
        nama: "Ahmad Ridho",
        jabatan: "Analis",
        status: "SPT",
        createdAt: "2024-11-15T08:30:00Z",
        updatedAt: "2024-11-21T09:00:00Z"
    },
    {
        id: 4,
        nama: "Rina Wijaya",
        jabatan: "Analis",
        status: "SIAP",
        createdAt: "2024-11-15T08:45:00Z",
        updatedAt: "2024-11-19T16:20:00Z"
    },
    {
        id: 5,
        nama: "Doni Hermawan",
        jabatan: "Teknisi Laboratorium",
        status: "STANDBY",
        createdAt: "2024-11-15T09:00:00Z",
        updatedAt: "2024-11-18T13:45:00Z"
    },
    {
        id: 6,
        nama: "Lina Kusuma",
        jabatan: "Staf Administrasi",
        status: "SIAP",
        createdAt: "2024-11-15T09:15:00Z",
        updatedAt: "2024-11-20T11:30:00Z"
    },
    {
        id: 7,
        nama: "Hendra Wijaya",
        jabatan: "Teknisi Kalibrasi",
        status: "CUTI",
        createdAt: "2024-11-15T09:30:00Z",
        updatedAt: "2024-11-17T10:00:00Z"
    },
    {
        id: 8,
        nama: "Maya Putri",
        jabatan: "Analis",
        status: "SIAP",
        createdAt: "2024-11-15T09:45:00Z",
        updatedAt: "2024-11-21T08:15:00Z"
    },
    {
        id: 9,
        nama: "Raden Suryanto",
        jabatan: "Kepala Divisi Pengujian",
        status: "SIAP",
        createdAt: "2024-11-15T10:00:00Z",
        updatedAt: "2024-11-20T15:00:00Z"
    },
    {
        id: 10,
        nama: "Dewi Lestari",
        jabatan: "Analis Senior",
        status: "SPT",
        createdAt: "2024-11-15T10:15:00Z",
        updatedAt: "2024-11-21T09:30:00Z"
    }
];

// Status yang tersedia
export const PegawaiStatusOptions = [
    { value: "SIAP", label: "Siap" },
    { value: "SPT", label: "SPT" },
    { value: "STANDBY", label: "Standby" },
    { value: "CUTI", label: "Cuti" }
];

// Daftar jabatan yang tersedia
export const JabatanOptions = [
    "Kepala Laboratorium",
    "Kepala Divisi Pengujian",
    "Analis Senior",
    "Analis",
    "Teknisi Laboratorium",
    "Teknisi Kalibrasi",
    "Staf Administrasi",
    "Operator Alat"
];
