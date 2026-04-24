const internshipTaskService = () => {
  const url = "/internship/task";
  const api = useApi();

  async function getTasksByMentor(mentorId: string) {
    return api.get(`${url}/mentor/${mentorId}`);
  }

  async function getTasksByStudent(studentId: string) {
    return api.get(`${url}/student/${studentId}`);
  }

  async function createTask(data: any) {
    return api.post(url, data);
  }

  async function submitTask(data: any) {
    return api.post(`${url}/submit`, data);
  }

  async function gradeTask(id: string, data: any) {
    return api.put(`${url}/grade/${id}`, data);
  }

  return {
    getTasksByMentor,
    getTasksByStudent,
    createTask,
    submitTask,
    gradeTask,
  };
};

export default internshipTaskService;
