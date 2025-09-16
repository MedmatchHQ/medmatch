import {
  createTestProfessionalProfile,
  getProfessionalProfileData,
} from "#/modules/professional-profiles/utils/professional-profile.helpers";
import { TestProfessionalProfileValidator } from "#/modules/professional-profiles/utils/professional-profile.validators";
import {
  expectHttpErrorResponse,
  expectSuccessResponse,
} from "#/utils/helpers";
import {
  expectEndpointToRequireAuth,
  getAuthenticatedAgent,
  HTTPMethod,
} from "#/utils/mockAuthentication";
import { expectValidationErrors } from "#/utils/validation";
import {
  ProfessionalProfile,
  ProfessionalProfileModel,
} from "@/modules/professional-profiles/professional-profile.model";
import { ProfessionalProfileCode } from "@/modules/professional-profiles/utils/professional-profile.errors";
import { Types } from "mongoose";
import TestAgent from "supertest/lib/agent";

describe("Professional Profile Router", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("endpoint authentication", () => {
    test.each<[HTTPMethod, string]>([
      ["get", "/api/professional-profiles"],
      ["get", "/api/professional-profiles/:id"],
      ["post", "/api/professional-profiles"],
      ["patch", "/api/professional-profiles/:id"],
      ["delete", "/api/professional-profiles/:id"],
    ])("`%s %s` should require authentication", async (method, endpoint) => {
      await expectEndpointToRequireAuth(method, endpoint);
    });
  });

  describe("GET /", () => {
    it("should return an empty list when there are no professional profiles", async () => {
      const response = await agent.get("/api/professional-profiles");

      expectSuccessResponse(response);
      expect(response.body.data).toEqual([]);
    });

    it("should return all professional profiles", async () => {
      const profile = await createTestProfessionalProfile();

      const response = await agent.get("/api/professional-profiles");

      expectSuccessResponse(
        response,
        [TestProfessionalProfileValidator],
        [profile]
      );
    });
  });

  describe("GET /:id", () => {
    it("should return a professional profile by id", async () => {
      const profile = await createTestProfessionalProfile();

      const response = await agent.get(
        `/api/professional-profiles/${profile.id}`
      );

      expectSuccessResponse(
        response,
        TestProfessionalProfileValidator,
        profile
      );
    });

    it("should return an error for professional profile not found", async () => {
      await createTestProfessionalProfile();
      const badId = new Types.ObjectId();

      const response = await agent.get(`/api/professional-profiles/${badId}`);

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: ProfessionalProfileCode.ProfessionalProfileNotFound,
          },
        ],
      });
    });
  });

  describe("POST /", () => {
    it("should create a new professional profile", async () => {
      const profileData = await getProfessionalProfileData();

      const response = await agent
        .post("/api/professional-profiles")
        .send(profileData);

      expect(response.body.data).toBeDefined();
      const profile = await ProfessionalProfileModel.findById(
        response.body.data.id
      );
      expect(profile).toBeDefined();
      expectSuccessResponse(
        response,
        TestProfessionalProfileValidator,
        ProfessionalProfile.fromDoc(profile!),
        {
          status: 201,
        }
      );
    });

    it("should return validation errors for invalid data", async () => {
      const invalidData = {
        // Missing required fields: name, tag, accountId
        about: "Test about",
      };

      const response = await agent
        .post("/api/professional-profiles")
        .send(invalidData);

      expectValidationErrors(response, ["name", "tag", "accountId"]);
    });
  });

  describe("PATCH /:id", () => {
    it("should update an existing professional profile", async () => {
      const profile = await createTestProfessionalProfile();
      const updateData = {
        name: "Updated Professional Name",
        about: "Updated about section",
      };

      const response = await agent
        .patch(`/api/professional-profiles/${profile.id}`)
        .send(updateData);

      expectSuccessResponse(response, TestProfessionalProfileValidator);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.about).toBe(updateData.about);

      const updatedProfile = await ProfessionalProfileModel.findById(
        profile.id
      );
      expect(updatedProfile!.name).toBe(updateData.name);
      expect(updatedProfile!.about).toBe(updateData.about);
    });

    it("should return an error for professional profile not found", async () => {
      const badId = new Types.ObjectId();
      const updateData = { name: "Updated Name" };

      const response = await agent
        .patch(`/api/professional-profiles/${badId}`)
        .send(updateData);

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: ProfessionalProfileCode.ProfessionalProfileNotFound,
          },
        ],
      });
    });
  });

  describe("DELETE /:id", () => {
    it("should delete an existing professional profile", async () => {
      const profile1 = await createTestProfessionalProfile();
      const profile2 = await createTestProfessionalProfile();

      const response = await agent.delete(
        `/api/professional-profiles/${profile1.id}`
      );

      expectSuccessResponse(
        response,
        TestProfessionalProfileValidator,
        profile1
      );
      const profiles = await ProfessionalProfileModel.find();
      expect(profiles.length).toBe(1);
      expect(profiles[0]!.id).toEqual(profile2.id);
    });

    it("should return an error for professional profile not found", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.delete(
        `/api/professional-profiles/${badId}`
      );

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: ProfessionalProfileCode.ProfessionalProfileNotFound,
          },
        ],
      });
    });
  });
});
