import { useState, useEffect } from "react";
import { courseService } from "@services/courseService";
import api from "@services/api";
import Icon from "@components/Icon";

function CourseMaterialsModal({ isOpen, onClose, course, readOnly = false }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: "",
    type: "document",
    description: "",
    order: 0,
  });
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      fetchMaterials();
    }
  }, [isOpen, course]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${course._id}/details`);
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch materials");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm((prev) => ({
        ...prev,
        file,
        title: prev.title || file.name,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("title", uploadForm.title);
      formData.append("type", uploadForm.type);
      formData.append("description", uploadForm.description);
      formData.append("order", uploadForm.order);

      const response = await api.post(
        `/courses/${course._id}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setShowUploadForm(false);
        setUploadForm({
          file: null,
          title: "",
          type: "document",
          description: "",
          order: 0,
        });
        fetchMaterials();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      await api.delete(`/courses/materials/${materialId}`);
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete material");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Icon name="video" className="h-5 w-5 text-red-500" />;
      case "presentation":
        return <Icon name="presentation" className="h-5 w-5 text-orange-500" />;
      case "document":
      default:
        return <Icon name="document" className="h-5 w-5 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Course Materials
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {course?.courseCode} - {course?.name}
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Upload Form */}
          {!readOnly &&
            (showUploadForm ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Upload New Material
                </h4>
                <form onSubmit={handleUpload}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif,.zip,.rar"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Max file size: 100MB. Supported formats: PDF, Word,
                        PowerPoint, Excel, Videos, Images, ZIP
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={uploadForm.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter material title"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={uploadForm.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="document">Document</option>
                        <option value="video">Video</option>
                        <option value="presentation">Presentation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={uploadForm.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Optional description"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={uploading || !uploadForm.file}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowUploadForm(true)}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Icon name="upload" className="mr-2 h-5 w-5" />
                Upload Material
              </button>
            ))}

          {/* Materials List */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Materials ({materials.length})
            </h4>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading materials...
                </p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Icon
                  name="file-empty"
                  className="mx-auto h-12 w-12 text-gray-400"
                />
                <p className="mt-2 text-sm text-gray-500">
                  No materials uploaded yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((material) => (
                  <div
                    key={material._id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {getTypeIcon(material.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {material.title}
                        </p>
                        {material.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {material.description}
                          </p>
                        )}
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {material.type.charAt(0).toUpperCase() +
                              material.type.slice(1)}
                          </span>
                          {material.url.startsWith("/uploads/") && (
                            <a
                              href={`http://localhost:5001${material.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(material._id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        <Icon name="delete" className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-5 border-t border-gray-200">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseMaterialsModal;
