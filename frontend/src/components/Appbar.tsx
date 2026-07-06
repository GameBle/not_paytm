import { logout } from "../api/client";
import { useNavigate } from "react-router-dom";

interface AppbarProps {
  firstName: string | null;
}

export function Appbar({ firstName }: AppbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="shadow h-14 flex justify-between">
      <div className="flex flex-col justify-center h-full ml-4 font-semibold">
        PayTM App
      </div>
      <div className="flex items-center">
        <div className="flex flex-col justify-center h-full mr-4">
          Hello, {firstName ?? "User"}
        </div>
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          {firstName ? (
            <div className="flex flex-col justify-center h-full text-xl">
              {firstName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <span className="text-sm flex items-center">...</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="mr-4 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
