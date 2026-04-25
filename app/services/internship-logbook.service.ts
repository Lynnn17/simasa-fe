export default function internshipLogbookService() {
  const api = useApi();

  return {
    async submitLogbook(payload: any) {
      return await api.post("/internship/logbook/", payload);
    },

    async getStudentHistory(studentId: string, params?: any) {
      return await api.get(`/internship/logbook/student/${studentId}`, { params });
    },

    async getMentorDashboard(mentorId: string, params?: any) {
      return await api.get(`/internship/logbook/mentor/${mentorId}`, { params });
    },

    async updateLogbook(id: string, payload: any) {
      return await api.put(`/internship/logbook/${id}`, payload);
    },

    async updateLogbookStatus(id: string, payload: any) {
      return await api.put(`/internship/logbook/status/${id}`, payload);
    },
  };
}
