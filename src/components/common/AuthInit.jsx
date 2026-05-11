import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import { updateUser, logout } from "../../store/authSlice";
import { ROLES, normalizeRole, TOKEN_KEY, USER_KEY } from "../../utils/constants";

const AuthInit = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const profileData = res.data?.data || res.data;
        
        // Define role from profile, or fallback to the current user state's role, or 'ROLE_ADMIN' if previously logged in but missing from profile
        // Often backend /profile doesn't return role, but we need it locally to maintain Admin access
        let userRole = profileData?.role || user?.role;
        
        // If neither profile nor user state has the role, but we are authenticated in admin template, 
        // we should probably check if we can extract it from somewhere else, but for now fallback to ADMIN 
        // if user already bypassed the login check (since login checks it).
        if (!userRole && localStorage.getItem(TOKEN_KEY)) {
            const savedUser = localStorage.getItem(USER_KEY);
            if (savedUser) {
              try {
                const parsed = JSON.parse(savedUser);
                userRole = parsed.role;
              } catch(e){}
            }
        }

        if (userRole && normalizeRole(userRole) !== ROLES.ADMIN) {
          await authService.logout();
          dispatch(logout());
          return;
        }
        
        const userDataToUpdate = {
          ...profileData,
          role: userRole || ROLES.ADMIN // fallback if profile API is missing role
        };
        dispatch(updateUser(userDataToUpdate));
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

