import { Model } from "mongoose";
import {
  InputProfessionalProfile,
  ProfessionalProfile,
  ProfessionalProfileDoc,
  ProfessionalProfileModel,
  ProfessionalProfileSchema,
} from "./professional-profile.model";
import { ProfessionalProfileNotFoundError } from "./utils/professional-profile.errors";

/**
 * Handles professional profile-related business logic such as CRUD operations.
 */
class ProfessionalProfileService {
  constructor(
    private professionalProfileModel: Model<ProfessionalProfileSchema> = ProfessionalProfileModel
  ) {}

  /**
   * Retrieves all professional profiles from the database.
   * @returns An array of all professional profiles
   * @throws No specific errors, but may throw database-related errors
   */
  async getAllProfessionalProfiles(): Promise<ProfessionalProfile[]> {
    const docs = await this.professionalProfileModel
      .find<ProfessionalProfileDoc>()
      .exec();
    return docs.map((doc) => ProfessionalProfile.fromDoc(doc));
  }

  /**
   * Retrieves a professional profile by their unique identifier.
   * @param profileId The unique identifier of the professional profile
   * @returns The professional profile object if found
   * @throws A {@link ProfessionalProfileNotFoundError} if the professional profile with the specified id is not found
   */
  async getProfessionalProfileById(
    profileId: string
  ): Promise<ProfessionalProfile> {
    const doc = await this.professionalProfileModel
      .findById<ProfessionalProfileDoc>(profileId)
      .exec();
    if (!doc) {
      throw new ProfessionalProfileNotFoundError(
        `Professional profile with id ${profileId} not found`
      );
    }
    return ProfessionalProfile.fromDoc(doc);
  }

  /**
   * Creates a new professional profile with the provided data.
   * @param profileData Professional profile data used to create a new professional profile (no email/password - those are in Account)
   * @returns The newly created professional profile object
   */
  async createProfessionalProfile(
    profileData: InputProfessionalProfile
  ): Promise<ProfessionalProfile> {
    const profile = new this.professionalProfileModel(profileData);
    await profile.save();
    return ProfessionalProfile.fromDoc(profile as ProfessionalProfileDoc);
  }

  /**
   * Updates an existing professional profile with the provided data.
   * @param profileId The unique identifier of the professional profile to update
   * @param profileData Partial professional profile data to update
   * @returns The updated professional profile object
   * @throws A {@link ProfessionalProfileNotFoundError} if the professional profile with the specified id is not found
   */
  async updateProfessionalProfile(
    profileId: string,
    profileData: Partial<InputProfessionalProfile>
  ): Promise<ProfessionalProfile> {
    const doc = await this.professionalProfileModel
      .findByIdAndUpdate<ProfessionalProfileDoc>(profileId, profileData, {
        new: true,
      })
      .exec();
    if (!doc) {
      throw new ProfessionalProfileNotFoundError(
        `Professional profile with id ${profileId} not found`
      );
    }
    return ProfessionalProfile.fromDoc(doc);
  }

  /**
   * Deletes a professional profile by their unique identifier.
   * @param profileId The unique identifier of the professional profile to delete
   * @returns The deleted professional profile object
   * @throws A {@link ProfessionalProfileNotFoundError} if the professional profile with the specified id is not found
   */
  async deleteProfessionalProfile(
    profileId: string
  ): Promise<ProfessionalProfile> {
    const doc = await this.professionalProfileModel
      .findByIdAndDelete<ProfessionalProfileDoc>(profileId)
      .exec();
    if (!doc) {
      throw new ProfessionalProfileNotFoundError(
        `Professional profile with id ${profileId} not found`
      );
    }
    return ProfessionalProfile.fromDoc(doc);
  }
}

export { ProfessionalProfileService };
