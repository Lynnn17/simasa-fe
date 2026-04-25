const internshipTaskService = () => {
  const url = "/internship/task";
  const api = useApi();

  async function getTasksByMentor(mentorId: string, params?: any) {
    return api.get(`${url}/mentor/${mentorId}`, { params });
  }

  async function getTasksByStudent(studentId: string, params?: any) {
    return api.get(`${url}/student/${studentId}`, { params });
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

  async function editTask(id: string, data: any) {
    return api.put(`${url}/${id}`, data);
  }

  async function getTaskFiles(id: string) {
    return api.get(`${url}/${id}/files`);
  }

  async function downloadAll(id: string) {
    const response: any = await api.get(`${url}/${id}/download-all`, { responseType: 'blob' });
    const blob = new Blob([response]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `tugas-${id}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  function getFileUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const config = useRuntimeConfig();
    return `${config.public.apiBase}/files/${path}`;
  }

  return {
    getTasksByMentor,
    getTasksByStudent,
    createTask,
    submitTask,
    gradeTask,
    editTask,
    getTaskFiles,
    downloadAll,
    getFileUrl,
  };
};

export default internshipTaskService;
