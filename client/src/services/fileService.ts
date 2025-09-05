import apiClient from "@/lib/api/apiClient";
import { assertApiError, handleValidationErrors } from "@/lib/api/apiUtils";
import { FileDto } from "@/types/dto/fileDto";
import { FileCode } from "@/types/errorCodes";
import {
  NotFoundError,
  UnexpectedError,
  ValidationErrors,
} from "@/types/exception/serviceExceptions";

const withBase = (path: string) => `/files${path}`;

export class FileNotFoundError extends NotFoundError {}

function _mapErrorToException(error: unknown): Error {
  assertApiError(error);
  const { errors } = error.errorBody;
  handleValidationErrors(errors);
  const [httpError] = errors;
  switch (httpError?.code) {
    case FileCode.FileNotFound:
      return new FileNotFoundError(error, `File not found`);
    default:
      return new UnexpectedError(error);
  }
}

/**
 * Retrieves all file data from the database.
 * @returns A promise that resolves to an array of all file metadata objects
 * @throws A {@link ValidationErrors} if the request contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the request
 */
async function getAllFileData(): Promise<FileDto[]> {
  try {
    const { data: body } = await apiClient.get<FileDto[]>(withBase("/"));
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Retrieves a specific file's metadata by its unique identifier.
 * @param id - The unique identifier of the file to retrieve
 * @returns A promise that resolves to the file metadata object if found
 * @throws A {@link FileNotFoundError} if the file with the specified id is not found
 * @throws A {@link ValidationErrors} if the request contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the request
 */
async function getFileDataById(id: string): Promise<FileDto> {
  try {
    const { data: body } = await apiClient.get<FileDto>(withBase(`/${id}`));
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Downloads a file's binary data by its unique identifier.
 * @param id - The unique identifier of the file to download
 * @returns A promise that resolves to a Blob containing the file's binary data
 * @throws A {@link FileNotFoundError} if the file with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the request
 */
async function downloadFile(id: string): Promise<Blob> {
  try {
    const res = await apiClient.get<null, Blob>(withBase(`/${id}/download`), {
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Uploads a new file to the server using multipart/form-data.
 * @param file - The File object to upload (from HTML input or drag-and-drop)
 * @returns A promise that resolves to the newly created file metadata object
 * @throws A {@link ValidationErrors} if the file validation fails (e.g., unsupported file type or size)
 * @throws An {@link UnexpectedError} for any other errors that occur during the upload
 */
async function createFile(file: File): Promise<FileDto> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data: body } = await apiClient.post<FileDto>(
      withBase("/"),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Deletes a file from the server by its unique identifier.
 * @param id - The unique identifier of the file to delete
 * @returns A promise that resolves to the deleted file metadata object
 * @throws A {@link FileNotFoundError} if the file with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the deletion
 */
async function deleteFile(id: string): Promise<FileDto> {
  try {
    const { data: body } = await apiClient.delete<FileDto>(withBase(`/${id}`));
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Downloads a file and returns an object URL that can be used for display or linking.
 * Remember to call URL.revokeObjectURL() when done to free memory.
 * @param id - The unique identifier of the file to download
 * @returns A promise that resolves to an object URL string for the file
 * @throws A {@link FileNotFoundError} if the file with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the download
 */
async function downloadFileAsUrl(id: string): Promise<string> {
  const blob = await downloadFile(id);
  return URL.createObjectURL(blob);
}

/**
 * Downloads a file and automatically triggers the browser's save dialog for the user to save it locally.
 * The file will be downloaded with the specified filename or a default name based on the file ID.
 * @param id - The unique identifier of the file to download
 * @param filename - The suggested filename for the download (optional). If not provided, defaults to "file-{id}"
 * @returns A promise that resolves when the download is triggered (does not wait for user action)
 * @throws A {@link FileNotFoundError} if the file with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the download
 */
async function downloadFileAndSave(
  id: string,
  filename?: string
): Promise<void> {
  const blob = await downloadFile(id);
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `file-${id}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export {
  createFile,
  deleteFile,
  downloadFile,
  downloadFileAndSave,
  downloadFileAsUrl,
  getAllFileData,
  getFileDataById,
};
