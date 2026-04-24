const internshipAssignmentService = () => {
  const url = "/internship/mentor-assignment";
  const api = useApi();

  async function assignMentor(data: { studentId: string; mentorId: string }) {
    return api.post(url, data);
  }

  async function getMentorAssignments(req?: any) {
    return api.get(url, { params: req });
  }

  async function getStudentsByMentor(mentorId: string) {
    return api.get(`${url}/mentor/${mentorId}/students`);
  }

  return {
    assignMentor,
    getMentorAssignments,
    getStudentsByMentor,
  };
};

export default internshipAssignmentService;
