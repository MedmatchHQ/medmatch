import apiClient from "@/lib/api/apiClient";
import { assertApiError, handleValidationErrors } from "@/lib/api/apiUtils";
import {
  InputProfessionalProfile,
  ProfessionalProfileDto,
} from "@/types/dto/professionalProfileDto";
import {
  NotFoundError,
  UnexpectedError,
  ValidationErrors,
} from "@/types/exception/serviceExceptions";

const withBase = (path: string) => `/professional-profiles${path}`;

function _mapErrorToException(error: unknown): Error {
  assertApiError(error);
  handleValidationErrors(error.errorBody.errors);
  if (error.response?.status === 404) {
    return new NotFoundError(error, "Resource not found");
  }
  return new UnexpectedError(error);
}

/**
 * Retrieves all professional profiles from the database.
 * @returns A promise that resolves to an array of all professional profile objects
 * @throws A {@link ValidationErrors} if the request contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the request
 */
async function getAllProfessionalProfiles(): Promise<ProfessionalProfileDto[]> {
  try {
    const { data: body } = await apiClient.get<ProfessionalProfileDto[]>(
      withBase("/")
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Retrieves a specific professional profile by its unique identifier.
 * @param id - The unique identifier of the professional profile to retrieve
 * @returns A promise that resolves to the professional profile object if found
 * @throws A {@link NotFoundError} if the professional profile with the specified id is not found
 * @throws A {@link ValidationErrors} if the request contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the request
 */
async function getProfessionalProfileById(
  id: string
): Promise<ProfessionalProfileDto> {
  try {
    const { data: body } = await apiClient.get<ProfessionalProfileDto>(
      withBase(`/${id}`)
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Creates a new professional profile with the provided profile data.
 * @param profile - The professional profile data to create, including name, tag, account ID, and optional fields
 * @returns A promise that resolves to the newly created professional profile object
 * @throws A {@link ValidationErrors} if the profile data contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the creation
 */
async function createProfessionalProfile(
  profile: InputProfessionalProfile
): Promise<ProfessionalProfileDto> {
  try {
    const { data: body } = await apiClient.post<ProfessionalProfileDto>(
      withBase("/"),
      profile
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Updates an existing professional profile with the provided partial profile data.
 * Only the fields provided in the profile object will be updated; others will remain unchanged.
 * @param id - The unique identifier of the professional profile to update
 * @param profile - Partial professional profile data containing the fields to update
 * @returns A promise that resolves to the updated professional profile object
 * @throws A {@link NotFoundError} if the professional profile with the specified id is not found
 * @throws A {@link ValidationErrors} if the profile data contains validation errors
 * @throws An {@link UnexpectedError} for any other errors that occur during the update
 */
async function updateProfessionalProfile(
  id: string,
  profile: Partial<Omit<ProfessionalProfileDto, "id" | "entryDate">>
): Promise<ProfessionalProfileDto> {
  try {
    const { data: body } = await apiClient.patch<ProfessionalProfileDto>(
      withBase(`/${id}`),
      profile
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

/**
 * Deletes a professional profile by its unique identifier.
 * @param id - The unique identifier of the professional profile to delete
 * @returns A promise that resolves to the deleted professional profile object
 * @throws A {@link NotFoundError} if the professional profile with the specified id is not found
 * @throws An {@link UnexpectedError} for any other errors that occur during the deletion
 */
async function deleteProfessionalProfile(
  id: string
): Promise<ProfessionalProfileDto> {
  try {
    const { data: body } = await apiClient.delete<ProfessionalProfileDto>(
      withBase(`/${id}`)
    );
    return body.data;
  } catch (error) {
    throw _mapErrorToException(error);
  }
}

export {
  createProfessionalProfile,
  deleteProfessionalProfile,
  getAllProfessionalProfiles,
  getProfessionalProfileById,
  updateProfessionalProfile,
};
