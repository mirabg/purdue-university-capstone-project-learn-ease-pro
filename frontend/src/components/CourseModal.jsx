import { useState, useEffect } from "react";
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "@/store/apiSlice";
import { userService } from "@services/userService";
import Icon from "@components/Icon";

function CourseModal({ isOpen, onClose, course }) {
  const [formData, setFormData] = useState({
    courseCode: "",
    name: "",
    description: "",
    instructor: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);

  // RTK Query mutations
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const loading = isCreating || isUpdating;

  // Fetch instructors on component mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoadingInstructors(true);
        const response = await userService.getFacultyUsers();
        // Response structure: { success: true, data: [...] }
        const facultyUsers = response.data || [];
        setInstructors(facultyUsers);
      } catch (error) {
        console.error("Error fetching instructors:", error);
        setInstructors([]);
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, []);

  useEffect(() => {
    if (course) {
      // Extract instructor ID from instructor object
      let instructorId = "";
      if (course.instructor) {
        if (typeof course.instructor === "object" && course.instructor._id) {
          instructorId = course.instructor._id;
        } else if (typeof course.instructor === "string") {
          instructorId = course.instructor;
        }
      }

      setFormData({
        courseCode: course.courseCode || "",
        name: course.name || "",
        description: course.description || "",
        instructor: instructorId,
        isActive: course.isActive !== undefined ? course.isActive : true,
      });
    } else {
      setFormData({
        courseCode: "",
        name: "",
        description: "",
        instructor: "",
        isActive: true,
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [course, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = "Instructor is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitError(null);

    try {
      if (course) {
        // Update existing course
        await updateCourse({
          id: course._id,
          ...formData,
          __v: course.__v,
        }).unwrap();
      } else {
        // Create new course
        await createCourse(formData).unwrap();
      }
      onClose(); // Close modal - RTK Query handles refresh automatically
    } catch (err) {
      setSubmitError(err.data?.message || "Failed to save course");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {course ? "Edit Course" : "Create New Course"}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Course Code */}
          <div className="mb-4">
            <label
              htmlFor="courseCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Course Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              disabled={!!course}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.courseCode ? "border-red-500" : "border-gray-300"
              } ${course ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="e.g., CS101"
            />
            {errors.courseCode && (
              <p className="mt-1 text-sm text-red-500">{errors.courseCode}</p>
            )}
          </div>

          {/* Course Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Introduction to Computer Science"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter course description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Instructor */}
          <div className="mb-4">
            <label
              htmlFor="instructor"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Instructor <span className="text-red-500">*</span>
            </label>
            <select
              id="instructor"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              disabled={loadingInstructors}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.instructor ? "border-red-500" : "border-gray-300"
              } ${loadingInstructors ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">
                {loadingInstructors
                  ? "Loading instructors..."
                  : "Select an instructor"}
              </option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.firstName} {instructor.lastName}
                </option>
              ))}
            </select>
            {errors.instructor && (
              <p className="mt-1 text-sm text-red-500">{errors.instructor}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Active (visible to students)
              </span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : course ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CourseModal;
