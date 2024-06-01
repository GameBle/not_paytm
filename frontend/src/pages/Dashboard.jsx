import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"

export const Dashboard = () => {
    const [balance, setBalance] = useState(null);
    const {state} = useLocation();
    console.log(state);
    useEffect(() => {
        const fetchBalance = async () => {
            const token = localStorage.getItem("token");
            if (!token) return; 
            try {
                const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBalance(response.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };
        fetchBalance();
    }, []);
    return (
        <div>
          <Appbar />
          <div className="m-8">
            {balance !== null ? (
              <>
                <Balance value={balance} />
                <Users />
              </>
            ) : (
              <p>Loading balance...</p>
            )}
          </div>
        </div>
      );
}