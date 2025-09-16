import { FileNotFoundError } from "@/modules/files/utils/file.errors";
import { ObjectId } from "mongodb";
import { AuthService } from "../auth/auth.service";
import { AccountNotFoundError } from "../auth/utils/auth.errors";
import { FileService } from "../files/file.service";
import {
  InputExperience,
  InputStudentProfile,
  StudentProfile,
  StudentProfileDoc,
  StudentProfileModel,
  StudentProfileModelType,
  UnpopulatedStudentProfileDoc,
} from "./student-profile.model";
import {
  ExperienceNotFoundError,
  StudentProfileNotFoundError,
} from "./utils/student-profile.errors";

class StudentProfileService {
  constructor(
    private studentProfileModel: StudentProfileModelType = StudentProfileModel,
    private accountService: AuthService = new AuthService(),
    private fileService: FileService = new FileService()
  ) {}

  /**
   * Validates that optional file references exist in the database
   */
  private async validateFileReferences(
    profileData: Pick<InputStudentProfile, "picture" | "resume">
  ): Promise<void> {
    const fileChecks: Promise<void>[] = [];

    if (profileData.resume) {
      fileChecks.push(
        this.fileService
          .fileExists(profileData.resume.toString())
          .then((exists) => {
            if (!exists) {
              throw new FileNotFoundError(
                `Resume file with id ${profileData.resume} not found`
              );
            }
          })
      );
    }

    if (profileData.picture) {
      fileChecks.push(
        this.fileService
          .fileExists(profileData.picture.toString())
          .then((exists) => {
            if (!exists) {
              throw new FileNotFoundError(
                `Picture file with id ${profileData.picture} not found`
              );
            }
          })
      );
    }

    await Promise.all(fileChecks);
  }

  /**
   * Validates that the account exists
   */
  private async validateAccountExists(accountId: string): Promise<void> {
    if (!(await this.accountService.accountExists(accountId))) {
      throw new AccountNotFoundError(`Account with id ${accountId} not found`);
    }
  }

  /**
   * Retrieves all student profiles from the database with populated files.
   * @returns An array of all student profiles
   * @throws No specific errors, but may throw database-related errors
   */
  async getAllStudentProfiles(): Promise<StudentProfile[]> {
    const docs = await this.studentProfileModel
      .find<StudentProfileDoc>()
      .populate(["picture", "resume"])
      .exec();
    return docs.map((doc) => StudentProfile.fromDoc(doc));
  }

  /**
   * Retrieves a student profile by their unique identifier with populated files.
   * @param profileId The unique identifier of the student profile
   * @returns The student profile object if found
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  async getStudentProfileById(profileId: string): Promise<StudentProfile> {
    const doc = await this.studentProfileModel
      .findById<StudentProfileDoc>(profileId)
      .populate(["picture", "resume"])
      .exec();
    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Creates a new student profile with the provided data.
   * @param profileData Student profile data used to create a new student profile (no email/password - those are in Account)
   * @returns The newly created student profile object with populated files
   * @throws A {@link AccountNotFoundError} if the account with the specified id does not exist
   * @throws A {@link FileNotFoundError} if the picture or resume file references do not exist
   */
  async createStudentProfile(
    profileData: InputStudentProfile
  ): Promise<StudentProfile> {
    await Promise.all([
      this.validateFileReferences(profileData),
      this.validateAccountExists(profileData.accountId),
    ]);

    const profile = new this.studentProfileModel(profileData);
    await profile.save();
    await profile.populate(["picture", "resume"]);
    return StudentProfile.fromDoc(profile as StudentProfileDoc);
  }

  /**
   * Updates an existing student profile with the provided data.
   * @param profileId The unique identifier of the student profile to update
   * @param profileData Partial student profile data to update
   * @returns The updated student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   * @throws A {@link AccountNotFoundError} if the account with the specified id does not exist
   * @throws A {@link FileNotFoundError} if the picture or resume file references do not exist
   */
  async updateStudentProfile(
    profileId: string,
    profileData: Partial<InputStudentProfile>
  ): Promise<StudentProfile> {
    if (profileData.picture || profileData.resume) {
      await this.validateFileReferences(profileData);
    }
    if (profileData.accountId) {
      await this.validateAccountExists(profileData.accountId);
    }

    const doc = await this.studentProfileModel
      .findByIdAndUpdate<StudentProfileDoc>(profileId, profileData, {
        new: true,
      })
      .populate(["picture", "resume"])
      .exec();
    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Deletes a student profile by their unique identifier.
   * @param profileId The unique identifier of the student profile to delete
   * @returns The deleted student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  async deleteStudentProfile(profileId: string): Promise<StudentProfile> {
    const doc = await this.studentProfileModel
      .findByIdAndDelete<StudentProfileDoc>(profileId)
      .populate(["picture", "resume"])
      .exec();
    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Sets or updates the picture file reference for a student profile.
   * @param profileId The unique identifier of the student profile
   * @param fileId The unique identifier of the picture file to set
   * @returns The updated student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  async setPicture(profileId: string, fileId: string): Promise<StudentProfile> {
    const doc = await this.studentProfileModel
      .findByIdAndUpdate<StudentProfileDoc>(
        profileId,
        { picture: new ObjectId(fileId) },
        { new: true }
      )
      .populate(["picture", "resume"])
      .exec();

    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Removes the picture file reference from a student profile.
   * @param profileId The unique identifier of the student profile
   * @returns The updated student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  async removePicture(profileId: string): Promise<StudentProfile> {
    const doc = await this.studentProfileModel
      .findByIdAndUpdate<StudentProfileDoc>(
        profileId,
        { $unset: { picture: 1 } },
        { new: true }
      )
      .populate(["picture", "resume"])
      .exec();

    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Sets or updates the resume file reference for a student profile.
   * @param profileId The unique identifier of the student profile
   * @param fileId The unique identifier of the resume file to set
   * @returns The updated student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  async setResume(profileId: string, fileId: string): Promise<StudentProfile> {
    const doc = await this.studentProfileModel
      .findByIdAndUpdate<StudentProfileDoc>(
        profileId,
        { resume: new ObjectId(fileId) },
        { new: true }
      )
      .populate(["picture", "resume"])
      .exec();

    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Removes the resume file reference from a student profile.
   * @param profileId The unique identifier of the student profile
   * @returns The updated student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  async removeResume(profileId: string): Promise<StudentProfile> {
    const doc = await this.studentProfileModel
      .findByIdAndUpdate<StudentProfileDoc>(
        profileId,
        { $unset: { resume: 1 } },
        { new: true }
      )
      .populate(["picture", "resume"])
      .exec();

    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }
    return StudentProfile.fromDoc(doc);
  }

  /**
   * Adds a new experience to a student profile.
   * @param profileId The unique identifier of the student profile
   * @param experienceData The experience data to add
   * @returns The updated student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  async addExperience(
    profileId: string,
    experienceData: InputExperience
  ): Promise<StudentProfile> {
    const doc = await this.studentProfileModel
      .findById<UnpopulatedStudentProfileDoc>(profileId)
      .exec();

    if (!doc) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }

    doc.experiences.push(experienceData);
    await doc.save();

    await doc.populate(["picture", "resume"]);
    return StudentProfile.fromDoc(doc as StudentProfileDoc);
  }

  /**
   * Removes an experience from a student profile.
   * @param profileId The unique identifier of the student profile
   * @param experienceId The unique identifier of the experience to remove
   * @returns The updated student profile object with populated files
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   * @throws A {@link ExperienceNotFoundError} if the experience is not found in the profile
   */
  async removeExperience(
    profileId: string,
    experienceId: string
  ): Promise<StudentProfile> {
    const profile = await this.studentProfileModel
      .findById<UnpopulatedStudentProfileDoc>(profileId)
      .exec();

    if (!profile) {
      throw new StudentProfileNotFoundError(
        `Student profile with id ${profileId} not found`
      );
    }

    const experienceIndex = profile.experiences.findIndex(
      (exp) => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      throw new ExperienceNotFoundError(
        `Experience with id ${experienceId} not found for student profile with id ${profileId}`
      );
    }

    profile.experiences.splice(experienceIndex, 1);
    await profile.save();

    await profile.populate(["picture", "resume"]);
    return StudentProfile.fromDoc(profile as StudentProfileDoc);
  }
}

export { StudentProfileService };
