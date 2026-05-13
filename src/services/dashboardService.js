import api from "./api";

export const dashboardService = {
  getInstructorDashboard: async () => {
    const response = await api.get("/v1/dashboard/instructor");
    return { data: response.data?.data || response.data };
  },

  getInstructorReport: async ({ days = 30, year, month } = {}) => {
    const query = new URLSearchParams();
    if (year) query.append("year", String(year));
    if (month) query.append("month", String(month));
    if (!year && !month) query.append("days", String(days));
    const response = await api.get(`/v1/reports/instructor?${query.toString()}`);
    return { data: response.data?.data || response.data };
  },
};

