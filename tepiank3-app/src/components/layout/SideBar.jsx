import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "User", icon: "/icon-user.svg", link: "/User" },
    { name: "Order", icon: "/icon-order.svg", link: "/HomeAdm" },
    { name: "Cluster", icon: "/icon-cluster.svg", link: "/Cluster" },
    { name: "Pengujian", icon: "/icon-pengujian.svg", link: "/JenisPengujian" },
    { name: "Parameter", icon: "/icon-parameter.svg", link: "/Parameter" },
    { name: "Peralatan", icon: "/icon-peralatan.svg", link: "/Peralatan" },
    // { name: "Bahan", icon: "./icon-bahan.svg", link: "/Bahan" },
  ];

  return (
    <nav className="space-y-3">
      {menus.map((menu) => {
        const isActive = location.pathname === menu.link;

        return (
          <button
            key={menu.name}
            onClick={() => navigate(menu.link)}
            className={`w-full px-2 py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 text-sm transition-all duration-300
              ${isActive
                ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg"
                : "text-gray-700 font-medium backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
              }`}
          >
            <img src={menu.icon} alt={menu.name} className="w-5 h-5 align-middle" />
            <span className="text-sm align-middle">{menu.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
