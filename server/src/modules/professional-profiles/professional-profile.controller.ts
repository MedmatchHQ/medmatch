import { ControllerMethod } from "@/utils/errorHandler";
import { Request, Response } from "express";
import { InputProfessionalProfile } from "./professional-profile.model";
import { ProfessionalProfileService } from "./professional-profile.service";

class ProfessionalProfileController {
  constructor(
    private professionalProfileService: ProfessionalProfileService = new ProfessionalProfileService()
  ) {}

  /**
   * Retrieves all professional profiles from the database.
   * @returns An array of all professional profiles
   * @codes 200
   */
  @ControllerMethod()
  async getAllProfessionalProfiles(req: Request, res: Response): Promise<void> {
    const profiles =
      await this.professionalProfileService.getAllProfessionalProfiles();
    res.status(200).json({
      status: "success",
      data: profiles,
      message: "Professional profiles retrieved successfully",
    });
  }

  /**
   * Retrieves a specific professional profile by their unique identifier.
   * @param {string} req.params.id The unique identifier of the professional profile to retrieve
   * @returns The professional profile object if found
   * @codes 200, 404
   * @throws A {@link ProfessionalProfileNotFoundError} if the professional profile with the specified id is not found
   */
  @ControllerMethod()
  async getProfessionalProfileById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const profile =
      await this.professionalProfileService.getProfessionalProfileById(id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Professional profile with id ${profile.id} retrieved successfully`,
    });
  }

  /**
   * Creates a new professional profile with the provided data.
   * @param {InputProfessionalProfile} req.body The input professional profile data used to create a new profile
   * @returns The newly created professional profile object
   * @codes 201, 409
   * @throws A {@link ProfessionalProfileConflictError} if a professional profile already exists for the account
   */
  @ControllerMethod()
  async createProfessionalProfile(req: Request, res: Response): Promise<void> {
    const profileData: InputProfessionalProfile = req.body;
    const profile =
      await this.professionalProfileService.createProfessionalProfile(
        profileData
      );
    res.status(201).json({
      status: "success",
      data: profile,
      message: `Professional profile with id ${profile.id} created successfully`,
    });
  }

  /**
   * Updates an existing professional profile with the provided data.
   * @param {string} req.params.id The unique identifier of the professional profile to update
   * @param {Partial<InputProfessionalProfile>} req.body Partial professional profile data to update
   * @returns The updated professional profile object
   * @codes 200, 404
   * @throws A {@link ProfessionalProfileNotFoundError} if the professional profile with the specified id is not found
   */
  @ControllerMethod()
  async updateProfessionalProfile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const profileData = req.body;
    const profile =
      await this.professionalProfileService.updateProfessionalProfile(
        id,
        profileData
      );
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Professional profile with id ${profile.id} updated successfully`,
    });
  }

  /**
   * Deletes a professional profile by their unique identifier.
   * @param {string} req.params.id The unique identifier of the professional profile to delete
   * @returns The deleted professional profile object
   * @codes 200, 404
   * @throws A {@link ProfessionalProfileNotFoundError} if the professional profile with the specified id is not found
   */
  @ControllerMethod()
  async deleteProfessionalProfile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const profile =
      await this.professionalProfileService.deleteProfessionalProfile(id);
    res.status(200).json({
      status: "success",
      data: profile,
      message: `Professional profile with id ${profile.id} deleted successfully`,
    });
  }
}

export { ProfessionalProfileController };
