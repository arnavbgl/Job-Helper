import Header from "@/components/header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="relative min-h-screen">
      <main className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <Header />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
