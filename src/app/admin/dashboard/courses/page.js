"use client";

import Modal from "@/Component/Common/Modal";
import { DepartmentService, EnrollmentService, StudentService, SubjectService } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiSearch, FiUserCheck, FiUserMinus, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";

export default function CoursesPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptDetails, setDeptDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  
  const [activeTab, setActiveTab] = useState("departments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);
  
  // Form states
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', level: 'BACHELOR' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', creditHours: 3, semester: '', description: '' });

  // Enrollment modal states
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollStatusFilter, setEnrollStatusFilter] = useState('all');
  const [enrollActionLoading, setEnrollActionLoading] = useState(null);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await DepartmentService.getAll();
      setDepartments(response.data.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch department details
  const fetchDeptDetails = useCallback(async (deptId) => {
    if (!deptId) {
      toast.error("Invalid department reference");
      return;
    }

    try {
      setLoading(true);
      const response = await DepartmentService.getById(deptId);
      const dept = response.data?.data;

      if (!dept) {
        toast.error("Department not found");
        return;
      }

      setDeptDetails(dept);
      setStudents(dept.students || []);
      setSubjects(dept.subjects || []);
    } catch (err) {
      console.error("Error fetching department details:", err);
      toast.error("Failed to fetch department details");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available students and subjects for enrollment
  const fetchAvailableData = useCallback(async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        StudentService.getAll({ limit: 1000 }),
        SubjectService.getAll({ limit: 1000 })
      ]);
      setAllStudents(studentsRes.data.data || []);
      setAllSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching available data:", err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "departments" && !selectedDept) {
      fetchDepartments();
    }
  }, [activeTab, selectedDept, fetchDepartments]);

  useEffect(() => {
    if (activeTab === "details" && selectedDept) {
      fetchDeptDetails(selectedDept.id);
    }
  }, [activeTab, selectedDept, fetchDeptDetails]);

  useEffect(() => {
    if (isAddSubjectOpen || isEnrollStudentOpen) {
      fetchAvailableData();
    }
  }, [isAddSubjectOpen, isEnrollStudentOpen, fetchAvailableData]);

  // Create department
  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      toast.error("Name and code are required");
      return;
    }

    try {
      await DepartmentService.create(deptForm);
      toast.success("Department created successfully!");
      setDeptForm({ name: '', code: '', description: '', level: 'BACHELOR' });
      setIsCreateDeptOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.message || "Failed to create department");
    }
  };

  // Add subject to department
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) {
      toast.error("Name and code are required");
      return;
    }

    try {
      await SubjectService.create({
        ...subjectForm,
        departmentId: selectedDept.id,
        creditHours: parseInt(subjectForm.creditHours)
      });
      toast.success("Subject added successfully!");
      setSubjectForm({ name: '', code: '', creditHours: 3, semester: '', description: '' });
      setIsAddSubjectOpen(false);
      fetchDeptDetails(selectedDept.id);
    } catch (err) {
      toast.error(err.message || "Failed to add subject");
    }
  };

  // Enroll student in department
  const handleEnrollStudent = async (student) => {
    if (!selectedDept) return;

    // Get subjects in this department
    const deptSubjects = subjects;

    if (deptSubjects.length === 0) {
      toast.error("No subjects in this department to enroll");
      return;
    }

    setEnrollActionLoading(student.id);
    try {
      // Enroll in all department subjects
      const enrollPromises = deptSubjects.map(subject =>
        EnrollmentService.create({
          studentId: student.id,
          subjectId: subject.id
        })
      );

      await Promise.all(enrollPromises);
      toast.success(`${student.fullName} enrolled successfully!`);
      fetchDeptDetails(selectedDept.id);
    } catch (err) {
      toast.error(err.message || "Failed to enroll student");
    } finally {
      setEnrollActionLoading(null);
    }
  };

  // Unenroll student from department (remove from all subjects)
  const handleUnenrollStudent = async (student) => {
    if (!selectedDept) return;

    setEnrollActionLoading(student.id);
    try {
      // Get all enrollments for this student in department subjects
      const enrollmentPromises = subjects.map(subject =>
        EnrollmentService.getAll({
          studentId: student.id,
          subjectId: subject.id
        })
      );

      const enrollmentResults = await Promise.all(enrollmentPromises);

      // Delete all enrollments found
      const deletePromises = [];
      enrollmentResults.forEach(result => {
        const enrollments = result.data?.data || [];
        enrollments.forEach(enrollment => {
          deletePromises.push(EnrollmentService.delete(enrollment.id));
        });
      });

      if (deletePromises.length === 0) {
        toast.error("No enrollments found to remove");
        return;
      }

      await Promise.all(deletePromises);
      toast.success(`${student.fullName} unenrolled successfully!`);
      fetchDeptDetails(selectedDept.id);
    } catch (err) {
      toast.error(err.message || "Failed to unenroll student");
    } finally {
      setEnrollActionLoading(null);
    }
  };

  // Get students not in department (for enrollment)
  const getEnrollableStudents = () => {
    const enrolledIds = students.map(s => s.id);
    return allStudents.filter(s => !enrolledIds.includes(s.id) && s.level === selectedDept?.level);
  };

  // Check if student is enrolled in department
  const isStudentEnrolled = (studentId) => {
    return students.some(s => s.id === studentId);
  };

  // Filter students for enrollment modal
  const getFilteredStudentsForEnroll = () => {
    let filtered = allStudents.filter(s => s.level === selectedDept?.level);

    // Apply search filter
    if (enrollSearch) {
      const searchLower = enrollSearch.toLowerCase();
      filtered = filtered.filter(s =>
        s.fullName?.toLowerCase().includes(searchLower) ||
        s.studentId?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (enrollStatusFilter === 'enrolled') {
      filtered = filtered.filter(s => isStudentEnrolled(s.id));
    } else if (enrollStatusFilter === 'not_enrolled') {
      filtered = filtered.filter(s => !isStudentEnrolled(s.id));
    }

    return filtered;
  };

  // Get subjects not in department
  const getAddableSubjects = () => {
    const deptSubjectIds = subjects.map(s => s.id);
    return allSubjects.filter(s => !deptSubjectIds.includes(s.id));
  };

  if (loading && activeTab === "departments") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {selectedDept ? `${selectedDept.name} - ${selectedDept.level}` : 'Courses & Departments'}
          </h1>
          <p className="text-gray-400">
            {selectedDept ? 'Manage department students and subjects' : 'Manage departments and courses'}
          </p>
        </div>
        {!selectedDept && (
          <button
            onClick={() => setIsCreateDeptOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Create Department
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#25252b]">
        {!selectedDept ? (
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "departments"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All Departments
          </button>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === "details"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === "students"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === "subjects"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Subjects ({subjects.length})
            </button>
            <button
              onClick={() => setSelectedDept(null)}
              className="px-4 py-2 font-semibold text-gray-400 hover:text-white transition ml-auto"
            >
              Back
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* All Departments View */}
        {!selectedDept && activeTab === "departments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                No departments found
              </div>
            ) : (
              departments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => {
                    setSelectedDept(dept);
                    setActiveTab("details");
                  }}
                  className="bg-[#1e1e26] border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">{dept.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      dept.level === 'BACHELOR' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {dept.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Code: {dept.code}</p>
                  <p className="text-sm text-gray-400">{dept.description || 'No description'}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Department Details View */}
        {selectedDept && activeTab === "details" && deptDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1e1e26] border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Department Name</p>
              <p className="text-2xl font-bold text-white">{deptDetails.name}</p>
            </div>
            <div className="bg-[#1e1e26] border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Level</p>
              <span className={`text-lg font-bold ${deptDetails.level === 'BACHELOR' ? 'text-green-400' : 'text-blue-400'}`}>
                {deptDetails.level}
              </span>
            </div>
            <div className="bg-[#1e1e26] border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Code</p>
              <p className="text-2xl font-bold text-white">{deptDetails.code}</p>
            </div>
            <div className="md:col-span-3 bg-[#1e1e26] border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Description</p>
              <p className="text-white">{deptDetails.description || 'No description provided'}</p>
            </div>
            <div className="bg-indigo-600/20 border border-indigo-600 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-indigo-400">{deptDetails.students?.length || 0}</p>
            </div>
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Subjects</p>
              <p className="text-3xl font-bold text-green-400">{deptDetails.subjects?.length || 0}</p>
            </div>
          </div>
        )}

        {/* Students List */}
        {selectedDept && activeTab === "students" && (
          <div className="space-y-4">
            <button
              onClick={() => setIsEnrollStudentOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Enroll Student
            </button>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-600 bg-[#1e1e26] text-white rounded-lg">
                <thead className="bg-[#25252b]">
                  <tr>
                    <th className="border border-gray-600 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Student ID</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Level</th>
                    <th className="border border-gray-600 px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        No students enrolled
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const isLoading = enrollActionLoading === student.id;
                      return (
                        <tr key={student.id} className="hover:bg-[#2d2d39]">
                          <td className="border border-gray-600 px-4 py-2">{student.id}</td>
                          <td className="border border-gray-600 px-4 py-2">{student.fullName}</td>
                          <td className="border border-gray-600 px-4 py-2">{student.studentId}</td>
                          <td className="border border-gray-600 px-4 py-2">{student.email}</td>
                          <td className="border border-gray-600 px-4 py-2">{student.level}</td>
                          <td className="border border-gray-600 px-4 py-2 text-center">
                            <button
                              onClick={() => handleUnenrollStudent(student)}
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition flex items-center gap-1 mx-auto"
                            >
                              {isLoading ? (
                                <FiLoader className="animate-spin h-4 w-4" />
                              ) : (
                                <FiUserMinus className="h-4 w-4" />
                              )}
                              Unenroll
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subjects List */}
        {selectedDept && activeTab === "subjects" && (
          <div className="space-y-4">
            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Subject
            </button>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-600 bg-[#1e1e26] text-white rounded-lg">
                <thead className="bg-[#25252b]">
                  <tr>
                    <th className="border border-gray-600 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Code</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Credit Hours</th>
                    <th className="border border-gray-600 px-4 py-2 text-left">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400">
                        No subjects found
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-[#2d2d39]">
                        <td className="border border-gray-600 px-4 py-2">{subject.id}</td>
                        <td className="border border-gray-600 px-4 py-2">{subject.name}</td>
                        <td className="border border-gray-600 px-4 py-2">{subject.code}</td>
                        <td className="border border-gray-600 px-4 py-2">{subject.creditHours}</td>
                        <td className="border border-gray-600 px-4 py-2">{subject.semester || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
      <Modal
        isOpen={isCreateDeptOpen}
        onClose={() => setIsCreateDeptOpen(false)}
        title="Create Department"
        size="md"
      >
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., CS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Level *
            </label>
            <select
              value={deptForm.level}
              onChange={(e) => setDeptForm({ ...deptForm, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="BACHELOR">Bachelor (Undergraduate)</option>
              <option value="MASTER">Master (Postgraduate)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Department description..."
              rows="3"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsCreateDeptOpen(false)}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        title="Add Subject"
        size="md"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Data Structures"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subject Code *
            </label>
            <input
              type="text"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., CS102"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Credit Hours
              </label>
              <input
                type="number"
                value={subjectForm.creditHours}
                onChange={(e) => setSubjectForm({ ...subjectForm, creditHours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Semester
              </label>
              <input
                type="text"
                value={subjectForm.semester}
                onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Subject description..."
              rows="2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAddSubjectOpen(false)}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Add Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal - Table View */}
      <Modal
        isOpen={isEnrollStudentOpen}
        onClose={() => {
          setIsEnrollStudentOpen(false);
          setEnrollSearch('');
          setEnrollStatusFilter('all');
        }}
        title={`Enroll Students - ${selectedDept?.name || ''}`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Info Header */}
          <div className="bg-[#1e1e26] rounded-lg p-4 border border-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Department</p>
                <p className="text-white font-medium">{selectedDept?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-white font-medium">{selectedDept?.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Enrolled</p>
                <p className="text-green-400 font-bold">{students.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Subjects</p>
                <p className="text-blue-400 font-bold">{subjects.length}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={enrollSearch}
                onChange={(e) => setEnrollSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={enrollStatusFilter}
              onChange={(e) => setEnrollStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Students</option>
              <option value="enrolled">Enrolled Only</option>
              <option value="not_enrolled">Not Enrolled</option>
            </select>
          </div>

          {/* Students Table */}
          <div className="bg-[#2d2d39] rounded-xl border border-[#35353d] overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-white">
                <thead className="bg-[#25252b] sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">Email</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-400">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35353d]">
                  {getFilteredStudentsForEnroll().length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    getFilteredStudentsForEnroll().map((student) => {
                      const enrolled = isStudentEnrolled(student.id);
                      const isLoading = enrollActionLoading === student.id;

                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-[#35353d]/50 ${
                            enrolled ? "border-l-4 border-l-green-500" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium">{student.fullName}</p>
                          </td>
                          <td className="px-4 py-3 text-indigo-400 font-mono">
                            {student.studentId}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {enrolled ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-300">
                                Enrolled
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                                Not Enrolled
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {enrolled ? (
                              <button
                                onClick={() => handleUnenrollStudent(student)}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition flex items-center gap-1 mx-auto"
                              >
                                {isLoading ? (
                                  <FiLoader className="animate-spin h-4 w-4" />
                                ) : (
                                  <FiUserMinus className="h-4 w-4" />
                                )}
                                Unenroll
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnrollStudent(student)}
                                disabled={isLoading || subjects.length === 0}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition flex items-center gap-1 mx-auto"
                              >
                                {isLoading ? (
                                  <FiLoader className="animate-spin h-4 w-4" />
                                ) : (
                                  <FiUserCheck className="h-4 w-4" />
                                )}
                                Enroll
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {subjects.length === 0 && (
            <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-400 px-4 py-3 rounded-lg">
              No subjects in this department. Add subjects first before enrolling students.
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-[#35353d]">
            <button
              onClick={() => {
                setIsEnrollStudentOpen(false);
                setEnrollSearch('');
                setEnrollStatusFilter('all');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
