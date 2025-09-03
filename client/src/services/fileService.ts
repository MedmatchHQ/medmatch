import apiClient from "../lib/apiClient";

// Upload a file
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// Download a file by ID
export async function downloadFile(fileId: string) {
  const response = await apiClient.get(`/files/${fileId}/download`, {
    responseType: "blob",
  });
  return response.data;
}

// List all files
export async function listFiles() {
  const response = await apiClient.get("/files");
  return response.data;
}

// Delete a file by ID
export async function deleteFile(fileId: string) {
  const response = await apiClient.delete(`/files/${fileId}`);
  return response.data;
}
