const hrdService = () => {
  const url = "/hrd";
  const api = useApi();

  async function getMonitoringData(params?: any) {
    return api.get(`${url}/monitoring`, { params });
  }

  async function getStudentQuickView(studentId: string) {
    return api.get(`${url}/student-detail/${studentId}`);
  }

  return {
    getMonitoringData,
    getStudentQuickView,
  };
};

export default hrdService;
