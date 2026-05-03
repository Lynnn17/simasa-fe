const internshipAssignmentService = () => {
  const url = "/internship/mentor-assignment";
  const api = useApi();

  async function assignMentor(data: { studentId: string; mentorId: string; force?: boolean }) {
    return api.post(url, data);
  }

  async function getMentorAssignments(req?: any) {
    return api.get(url, { params: req });
  }

  async function getStudentsByMentor(mentorId: string) {
    return api.get(`${url}/mentor/${mentorId}/students`);
  }

  async function updateMentorAssignment(id: string, data: { studentId: string; mentorId: string }) {
    return api.put(`${url}/${id}`, data);
  }

  return {
    assignMentor,
    getMentorAssignments,
    getStudentsByMentor,
    updateMentorAssignment,
  };
};

export default internshipAssignmentService;
