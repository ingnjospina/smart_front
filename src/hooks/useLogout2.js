import {useCallback} from 'react';
import {useNavigate} from "react-router-dom";

export const UseLogout2 = () => {
    const nav = useNavigate()

    const logOut = useCallback(() => {
        window.localStorage.removeItem('loggedAppUser');
        nav('/')
        window.location.reload();
    }, [nav]);

    return {logOut};
};
