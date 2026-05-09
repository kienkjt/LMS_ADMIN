import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userService } from "../../services/userService";
import { updateUser, logout } from "../../store/authSlice";

const AuthInit = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const profileData = res.data?.data || res.data;
        dispatch(updateUser(profileData));
      } catch (err) {
        console.error("[AuthInit] Failed to fetch profile:", err);
        // Do not force logout unless it's explicitly 401 Unauthorized
        if (err.response?.status === 401) {
           // Token is actually invalid or expired and refresh failed
           dispatch(logout());
        }
      }
    };

    // Fetch profile if user is authenticated but missing full details like id
    if (isAuthenticated && (!user || !user.id)) {
      fetchProfile();
    }
  }, [isAuthenticated, user?.id, dispatch]);

  return children;
};

export default AuthInit;
