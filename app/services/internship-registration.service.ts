const internshipRegistrationService = () => {
  const url = "/internship/registration";
  const api = useApi();

  async function getRegistrations(
    req?: Record<string, string | number | boolean | undefined>,
  ) {
    return api.get(url, {
      params: req,
    });
  }

  async function updateRegistrationStatus(id: string, status: string) {
    return api.put(`${url}/status/${id}`, {
      status,
    });
  }

  async function register(data: any) {
    return api.post(url, data);
  }

  async function getAcceptedStudents() {
    return api.get(url, {
      params: { status: "accepted" },
    });
  }

  async function getAcceptedStudentsAll() {
    return api.get(url + "/all", {
      params: { status: "accepted" },
    });
  }

  return {
    getRegistrations,
    updateRegistrationStatus,
    register,
    getAcceptedStudents,
    getAcceptedStudentsAll,
  };
};

export default internshipRegistrationService;
