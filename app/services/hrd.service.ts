const hrdService = () => {
  const url = "/hrd";
  const api = useApi();

  async function getMonitoringData(params?: any) {
    return api.get(`${url}/monitoring`, { params });
  }

  return {
    getMonitoringData,
  };
};

export default hrdService;
