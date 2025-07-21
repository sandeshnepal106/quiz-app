import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import {toast} from "react-toastify";

export const AppContext = createContext();
axios.defaults.withCredentials = true;

export const AppContextProvider = (props) =>{
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () =>{
        setLoading(true);
        try {
            const res = await axios.get(backendUrl + '/api/user/check-auth')
            if(res.data.success) {
                setIsLoggedin(true);
            } else{
                setIsLoggedin(false);
                if(res.data.message !== "Not authorized. Try Again."){
                    toast.error(res.data.message);
                }
            }
        } catch (error) {
            setIsLoggedin(false);
            toast.error(error.message);
        } finally{
            setLoading(false);
        }
    };

    useEffect(()=>{
        checkAuth()
    }, []);

    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        loading
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}