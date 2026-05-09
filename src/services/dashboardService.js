import api from "./api";

export const dashboardService = {
  getInstructorDashboard: async () => {
    const response = await api.get("/v1/dashboard/instructor");
    return { data: response.data?.data || response.data };
  },
};

