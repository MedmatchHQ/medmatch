import { FileService } from "@/modules/files/file.service";
import { File, FileCreateData } from "@/modules/files/file.model";
import { ControllerMethod } from "@/utils/errorHandler";
import { Request, Response } from "express";
import { InputExperience, InputStudentProfile } from "./student-profile.model";
import { StudentProfileService } from "./student-profile.service";

class StudentProfileController {
  constructor(
    private studentProfileService: StudentProfileService = new StudentProfileService(),
    private fileService: FileService = new FileService()
  ) {}

  /**
   * Retrieves all student profiles from the database with populated files.
   * @returns An array of all student profiles
   * @codes 200
   */
  @ControllerMethod()
  async getAllStudentProfiles(req: Request, res: Response): Promise<void> {
    const profiles = await this.studentProfileService.getAllStudentProfiles();
    res.status(200).json({
      status: "success",
      data: profiles,
      message: "Student profiles retrieved successfully",
    });
  }

  /**
   * Retrieves a specific student profile by their unique identifier with populated files.
   * @param {string} req.params.id The unique identifier of the student profile to retrieve
   * @returns The student profile object if found
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async getStudentProfileById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const profile = await this.studentProfileService.getStudentProfileById(id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Student profile with id ${profile.id} retrieved successfully`,
    });
  }

  /**
   * Creates a new student profile with the provided data.
   * @param {InputStudentProfile} req.body The input student profile data used to create a new profile
   * @returns The newly created student profile object with populated files
   * @codes 201, 409
   * @throws A {@link StudentProfileConflictError} if a student profile already exists for the account
   */
  @ControllerMethod()
  async createStudentProfile(req: Request, res: Response): Promise<void> {
    const profileData: InputStudentProfile = req.body;
    const profile = await this.studentProfileService.createStudentProfile(
      profileData
    );
    res.status(201).json({
      status: "success",
      data: profile,
      message: `Student profile with id ${profile.id} created successfully`,
    });
  }

  /**
   * Updates an existing student profile with the provided data.
   * @param {string} req.params.id The unique identifier of the student profile to update
   * @param {Partial<InputStudentProfile>} req.body Partial student profile data to update
   * @returns The updated student profile object with populated files
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async updateStudentProfile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const profileData = req.body;
    const profile = await this.studentProfileService.updateStudentProfile(
      id,
      profileData
    );
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Student profile with id ${profile.id} updated successfully`,
    });
  }

  /**
   * Deletes a student profile by their unique identifier.
   * @param {string} req.params.id The unique identifier of the student profile to delete
   * @returns The deleted student profile object with populated files
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async deleteStudentProfile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const profile = await this.studentProfileService.deleteStudentProfile(id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Student profile with id ${profile.id} deleted successfully`,
    });
  }

  /**
   * Creates a new file from uploaded data and sets it as the student profile's picture.
   * @param {string} req.params.id The unique identifier of the student profile
   * @param {Express.Multer.File} req.file The uploaded picture file data from multer middleware
   * @returns The updated student profile object with the new picture
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async setPicture(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fileData = req.file!;
    const file = await this.fileService.createFile({
      name: fileData.originalname,
      type: fileData.mimetype,
      data: fileData.buffer,
    } as FileCreateData);
    const profile = await this.studentProfileService.setPicture(id, file.id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Picture ${file.name} with id ${file.id} successfully set for student profile with id ${profile.id}`,
    });
  }

  /**
   * Removes the picture from a student profile and deletes it from the database.
   * @param {string} req.params.id The unique identifier of the student profile
   * @returns The updated student profile object with the picture removed
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async removePicture(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // Get the current profile to access the picture file ID
    const currentProfile =
      await this.studentProfileService.getStudentProfileById(id);

    if (currentProfile.picture) {
      await this.fileService.deleteFile(currentProfile.picture.id);
    }

    const profile = await this.studentProfileService.removePicture(id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: "Picture removed successfully",
    });
  }

  /**
   * Creates a new file from uploaded data and sets it as the student profile's resume.
   * @param {string} req.params.id The unique identifier of the student profile
   * @param {Express.Multer.File} req.file The uploaded resume file data from multer middleware
   * @returns The updated student profile object with the new resume
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async setResume(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fileData = req.file!;
    const file = await this.fileService.createFile({
      name: fileData.originalname,
      type: fileData.mimetype,
      data: fileData.buffer,
    } as FileCreateData);
    const profile = await this.studentProfileService.setResume(id, file.id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Resume ${file.name} with id ${file.id} successfully set for student profile with id ${profile.id}`,
    });
  }

  /**
   * Removes the resume from a student profile and deletes it from the database.
   * @param {string} req.params.id The unique identifier of the student profile
   * @returns The updated student profile object with the resume removed
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async removeResume(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // Get the current profile to access the resume file ID
    const currentProfile =
      await this.studentProfileService.getStudentProfileById(id);

    if (currentProfile.resume) {
      await this.fileService.deleteFile(currentProfile.resume.id);
    }

    const profile = await this.studentProfileService.removeResume(id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: "Resume removed successfully",
    });
  }

  /**
   * Adds a new experience to a student profile.
   * @param {string} req.params.id The unique identifier of the student profile
   * @param {InputExperience} req.body The experience data to add
   * @returns The updated student profile object with the new experience
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   */
  @ControllerMethod()
  async addExperience(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const experienceData = req.body;
    const profile = await this.studentProfileService.addExperience(
      id,
      experienceData
    );
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Experience "${experienceData.jobTitle}" successfully added to student profile with id ${profile.id}`,
    });
  }

  /**
   * Removes an experience from a student profile.
   * @param {string} req.params.id The unique identifier of the student profile
   * @param {string} req.params.experienceId The unique identifier of the experience to remove
   * @returns The updated student profile object with the experience removed
   * @codes 200, 404
   * @throws A {@link StudentProfileNotFoundError} if the student profile with the specified id is not found
   * @throws A {@link FileNotFoundError} if the experience is not found in the profile
   */
  @ControllerMethod()
  async removeExperience(req: Request, res: Response): Promise<void> {
    const { id, experienceId } = req.params;
    const profile = await this.studentProfileService.removeExperience(
      id,
      experienceId
    );
    res.status(200).json({
      status: "success",
      data: profile,
      message: "Experience removed successfully",
    });
  }
}

export { StudentProfileController };
