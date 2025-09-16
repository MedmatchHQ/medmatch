import apiClient from "@/lib/api/apiClient";
import {
  InputExperience,
  InputStudentProfile,
  StudentProfileDto,
} from "@/types/dto/studentProfileDto";
import { AccountCode, FileCode, StudentProfileCode } from "@/types/errorCodes";
import {
  NotFoundError,
  UnexpectedError,
  ValidationErrors,
} from "@/types/exception/serviceExceptions";
import {
  ApiAxiosError,
  hasValidationErrors,
  HttpError,
  isApiAxiosError,
  ValidationError,
} from "@/types/responses";
import { FileNotFoundError } from "./fileService";
import { assertApiError, handleValidationErrors } from "@/lib/api/apiUtils";

const withBase = (path: string) => `/student-profiles${path}`;

class StudentProfileNotFoundError extends NotFoundError {}

class AccountNotFoundError extends NotFoundError {}

class ExperienceNotFoundError extends NotFoundError {}

function _mapErrorToException(error: unknown): Error {
  assertApiError(error);
  const { errors } = error.errorBody;
  handleValidationErrors(errors);
  const [httpError] = errors;
  switch (httpError?.code) {
    case FileCode.FileNotFound:
      return new FileNotFoundError(error, `Picture or Resume not found`);
    case AccountCode.AccountNotFound:
      return new AccountNotFoundError(error, `Account not found`);
    case StudentProfileCode.StudentProfileNotFound:
      return new StudentProfileNotFoundError(
        error,
        `Student profile not found`
      );
    case StudentProfileCode.ExperienceNotFound:
      return new ExperienceNotFoundError(
        error,
        `Experience not found in profile`
      );
    default:
      return new UnexpectedError(error);
  }
}

/**
 * Retrieves all student profiles from the database with populated file references.
 * @returns A promise that resolves to an array of all student profile objects with their associated files
 * @throws A {@link ValidationErrors} if the request contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the request
 */
async function getAllStudentProfiles(): Promise<StudentProfileDto[]> {
  try {
    const { data: body } = await apiClient.get<StudentProfileDto[]>(
      withBase("/")
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Retrieves a specific student profile by its unique identifier with populated file references.
 * @param id - The unique identifier of the student profile to retrieve
 * @returns A promise that resolves to the student profile object with associated files and experiences
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws A {@link ValidationErrors} if the request contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the request
 */
async function getStudentProfileById(id: string): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.get<StudentProfileDto>(
      withBase(`/${id}`)
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Creates a new student profile with the provided profile data.
 * @param profile - The student profile data to create, including personal information, experiences, and optional file references
 * @returns A promise that resolves to the newly created student profile object with populated files
 * @throws A {@link ValidationErrors} if the profile data contains validation errors
 * @throws A {@link AccountNotFoundError} if the specified account ID does not exist
 * @throws A {@link FileNotFoundError} if any referenced file IDs (picture or resume) do not exist
 * @throws An {@link UnexpectedError} for any other errors that occur during the creation
 */
async function createStudentProfile(
  profile: InputStudentProfile
): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.post<StudentProfileDto>(
      withBase("/"),
      profile
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Updates an existing student profile with the provided partial profile data.
 * Only the fields provided in the profile object will be updated; others will remain unchanged.
 * Note: Picture and resume files should be updated using dedicated file management functions.
 * @param id - The unique identifier of the student profile to update
 * @param profile - Partial student profile data containing the fields to update
 * @returns A promise that resolves to the updated student profile object with populated files
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws A {@link ValidationErrors} if the profile data contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the update
 */
async function updateStudentProfile(
  id: string,
  profile: Partial<Omit<StudentProfileDto, "id" | "entryDate" | "fullName">>
): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.patch<StudentProfileDto>(
      withBase(`/${id}`),
      profile
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Deletes a student profile by its unique identifier.
 * @param id - The unique identifier of the student profile to delete
 * @returns A promise that resolves to the deleted student profile object with populated files
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the deletion
 */
async function deleteStudentProfile(id: string): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.delete<StudentProfileDto>(
      withBase(`/${id}`)
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Uploads and sets a picture file for a student profile, replacing any existing picture.
 * @param id - The unique identifier of the student profile
 * @param file - The image file to upload and set as the profile picture
 * @returns A promise that resolves to the updated student profile object with the new picture
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws A {@link ValidationErrors} if the file validation fails (e.g., unsupported file type or size)
 * @throws An {@link UnexpectedError} for any other errors that occur during the upload
 */
async function setPicture(id: string, file: File): Promise<StudentProfileDto> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data: body } = await apiClient.post<StudentProfileDto>(
      withBase(`/${id}/picture`),
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
 * Removes the picture from a student profile and deletes it from the server.
 * @param id - The unique identifier of the student profile
 * @returns A promise that resolves to the updated student profile object without a picture
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the removal
 */
async function removePicture(id: string): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.delete<StudentProfileDto>(
      withBase(`/${id}/picture`)
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Uploads and sets a resume file for a student profile, replacing any existing resume.
 * @param id - The unique identifier of the student profile
 * @param file - The resume file to upload (typically PDF or document format)
 * @returns A promise that resolves to the updated student profile object with the new resume
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws A {@link ValidationErrors} if the file validation fails (e.g., unsupported file type or size)
 * @throws An {@link UnexpectedError} for any other errors that occur during the upload
 */
async function setResume(id: string, file: File): Promise<StudentProfileDto> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data: body } = await apiClient.post<StudentProfileDto>(
      withBase(`/${id}/resume`),
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
 * Removes the resume from a student profile and deletes it from the server.
 * @param id - The unique identifier of the student profile
 * @returns A promise that resolves to the updated student profile object without a resume
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the removal
 */
async function removeResume(id: string): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.delete<StudentProfileDto>(
      withBase(`/${id}/resume`)
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Adds a new work experience entry to a student profile.
 * @param id - The unique identifier of the student profile
 * @param experience - The experience data to add, including job title, dates, and optional description
 * @returns A promise that resolves to the updated student profile object with the new experience
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws A {@link ValidationErrors} if the experience data contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the addition
 */
async function addExperience(
  id: string,
  experience: InputExperience
): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.post<StudentProfileDto>(
      withBase(`/${id}/experiences`),
      experience
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Removes a specific work experience entry from a student profile.
 * @param id - The unique identifier of the student profile
 * @param experienceId - The unique identifier of the experience entry to remove
 * @returns A promise that resolves to the updated student profile object without the specified experience
 * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
 * @throws A {@link ExperienceNotFoundError} if the experience with the specified id is not found in the profile
 * @throws An {@link UnexpectedError} for any other errors that occur during the removal
 */
async function removeExperience(
  id: string,
  experienceId: string
): Promise<StudentProfileDto> {
  try {
    const { data: body } = await apiClient.delete<StudentProfileDto>(
      withBase(`/${id}/experiences/${experienceId}`)
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

export {
  addExperience,
  createStudentProfile,
  deleteStudentProfile,
  getAllStudentProfiles,
  getStudentProfileById,
  removeExperience,
  removePicture,
  removeResume,
  setPicture,
  setResume,
  updateStudentProfile,
};
