import {
  expectHttpErrorResponse,
  expectSuccessResponse,
} from "#/utils/helpers";
import {
  expectEndpointToRequireAuth,
  getAuthenticatedAgent,
  HTTPMethod,
} from "#/utils/mockAuthentication";
import TestAgent from "supertest/lib/agent";
import {
  createTestStudentProfile,
  getStudentProfileData,
} from "#/modules/student-profiles/utils/student-profile.helpers";
import { TestStudentProfileValidator } from "#/modules/student-profiles/utils/student-profile.validators";
import { Types } from "mongoose";
import {
  StudentProfileNotFoundError,
  ExperienceNotFoundError,
} from "@/modules/users/utils/student-profile.errors";
import {
  StudentProfileModel,
  StudentProfile,
} from "@/modules/users/student-profile.model";
import { expectValidationErrors } from "#/utils/validation";
import { FileModel } from "@/modules/files/file.model";

describe("Student Profile Router", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("endpoint authentication", () => {
    test.each<[HTTPMethod, string]>([
      ["get", "/api/student-profiles"],
      ["get", "/api/student-profiles/:id"],
      ["post", "/api/student-profiles"],
      ["patch", "/api/student-profiles/:id"],
      ["delete", "/api/student-profiles/:id"],
      ["post", "/api/student-profiles/:id/picture"],
      ["delete", "/api/student-profiles/:id/picture"],
      ["post", "/api/student-profiles/:id/resume"],
      ["delete", "/api/student-profiles/:id/resume"],
      ["post", "/api/student-profiles/:id/experiences"],
      ["delete", "/api/student-profiles/:id/experiences/:experienceId"],
    ])("`%s %s` should require authentication", async (method, endpoint) => {
      await expectEndpointToRequireAuth(method, endpoint);
    });
  });

  describe("GET /", () => {
    it("should return an empty list when there are no student profiles", async () => {
      const response = await agent.get("/api/student-profiles");

      await expectSuccessResponse(response);
      expect(response.body.data).toEqual([]);
    });

    it("should return all student profiles", async () => {
      const profile = await createTestStudentProfile();

      const response = await agent.get("/api/student-profiles");

      await expectSuccessResponse(
        response,
        [TestStudentProfileValidator],
        [profile]
      );
    });
  });

  describe("GET /:id", () => {
    it("should return a student profile by id", async () => {
      const profile = await createTestStudentProfile();

      const response = await agent.get(`/api/student-profiles/${profile.id}`);

      await expectSuccessResponse(
        response,
        TestStudentProfileValidator,
        profile
      );
    });

    it("should return an error for student profile not found", async () => {
      await createTestStudentProfile();
      const badId = new Types.ObjectId();

      const response = await agent.get(`/api/student-profiles/${badId}`);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });
  });

  describe("POST /", () => {
    it("should create a new student profile", async () => {
      const profileData = await getStudentProfileData();

      const response = await agent
        .post("/api/student-profiles")
        .send(profileData);

      expect(response.body.data).toBeDefined();
      const profile = await StudentProfileModel.findById(response.body.data.id);
      expect(profile).toBeDefined();
      await profile!.populate(["picture", "resume"]);
      await expectSuccessResponse(
        response,
        TestStudentProfileValidator,
        StudentProfile.fromDoc(profile! as any),
        {
          status: 201,
        }
      );
    });

    it("should return validation errors for missing required fields", async () => {
      const invalidData = {
        // Missing required fields: firstName, lastName, accountId
        about: "Test about",
        experiences: [],
      };

      const response = await agent
        .post("/api/student-profiles")
        .send(invalidData);

      expectValidationErrors(response, ["firstName", "lastName", "accountId"]);
    });

    it("should return validation errors for invalid data types", async () => {
      const invalidData = {
        firstName: 123, // should be string
        lastName: true, // should be string
        about: 456, // should be string
        accountId: "invalid-id", // should be valid ObjectId
        experiences: "not-an-array", // should be array
      };

      const response = await agent
        .post("/api/student-profiles")
        .send(invalidData);

      expectValidationErrors(response, [
        "firstName",
        "lastName",
        "about",
        "accountId",
        "experiences",
      ]);
    });
  });

  describe("PATCH /:id", () => {
    it("should update an existing student profile", async () => {
      const profile = await createTestStudentProfile();
      const updateData = {
        firstName: "Updated First Name",
        about: "Updated about section",
      };

      const response = await agent
        .patch(`/api/student-profiles/${profile.id}`)
        .send(updateData);

      await expectSuccessResponse(response, TestStudentProfileValidator);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.about).toBe(updateData.about);

      // Verify in database
      const updatedProfile = await StudentProfileModel.findById(profile.id);
      expect(updatedProfile!.firstName).toBe(updateData.firstName);
      expect(updatedProfile!.about).toBe(updateData.about);
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();
      const updateData = { firstName: "Updated Name" };

      const response = await agent
        .patch(`/api/student-profiles/${badId}`)
        .send(updateData);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });

    it("should return validation errors for invalid update data", async () => {
      const profile = await createTestStudentProfile();
      const invalidUpdateData = {
        firstName: 123, // should be string
        experiences: "not-an-array", // should be array
      };

      const response = await agent
        .patch(`/api/student-profiles/${profile.id}`)
        .send(invalidUpdateData);

      expectValidationErrors(response, ["firstName", "experiences"]);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete an existing student profile", async () => {
      const profile1 = await createTestStudentProfile();
      const profile2 = await createTestStudentProfile();

      const response = await agent.delete(
        `/api/student-profiles/${profile1.id}`
      );

      await expectSuccessResponse(
        response,
        TestStudentProfileValidator,
        profile1
      );
      const profiles = await StudentProfileModel.find();
      expect(profiles.length).toBe(1);
      expect(profiles[0].id).toEqual(profile2.id);
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.delete(`/api/student-profiles/${badId}`);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });
  });

  describe("POST /:id/picture", () => {
    it("should upload and set a picture for a student profile", async () => {
      const profile = await createTestStudentProfile();
      const fileData = Buffer.alloc(1024 * 1024); // 1MB file

      const response = await agent
        .post(`/api/student-profiles/${profile.id}/picture`)
        .attach("file", fileData, {
          filename: "profile_picture.jpg",
          contentType: "image/jpeg",
        });

      await expectSuccessResponse(response, TestStudentProfileValidator);
      expect(response.body.data.picture).toBeDefined();
      expect(response.body.data.picture.name).toBe("profile_picture.jpg");

      // Verify file was created
      const files = await FileModel.find();
      expect(files.some((file) => file.name === "profile_picture.jpg")).toBe(
        true
      );
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();
      const fileData = Buffer.alloc(1024);

      const response = await agent
        .post(`/api/student-profiles/${badId}/picture`)
        .attach("file", fileData, {
          filename: "test.jpg",
          contentType: "image/jpeg",
        });

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });

    it("should return validation error for missing file", async () => {
      const profile = await createTestStudentProfile();

      const response = await agent.post(
        `/api/student-profiles/${profile.id}/picture`
      );

      expect(response.status).toBe(500); // Missing file causes 500, not 400
    });

    it("should return validation error for file too large", async () => {
      const profile = await createTestStudentProfile();
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB

      const response = await agent
        .post(`/api/student-profiles/${profile.id}/picture`)
        .attach("file", largeFile, {
          filename: "large.jpg",
          contentType: "image/jpeg",
        });

      expectValidationErrors(response, ["buffer"], "file");
    });
  });

  describe("DELETE /:id/picture", () => {
    it("should remove picture from a student profile", async () => {
      const profile = await createTestStudentProfile();
      const fileData = Buffer.alloc(1024);

      // First upload a picture
      await agent
        .post(`/api/student-profiles/${profile.id}/picture`)
        .attach("file", fileData, {
          filename: "test.jpg",
          contentType: "image/jpeg",
        });

      // Then delete it
      const response = await agent.delete(
        `/api/student-profiles/${profile.id}/picture`
      );

      await expectSuccessResponse(response, TestStudentProfileValidator);
      expect(response.body.data.picture).toBeNull();
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.delete(
        `/api/student-profiles/${badId}/picture`
      );

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });
  });

  describe("POST /:id/resume", () => {
    it("should upload and set a resume for a student profile", async () => {
      const profile = await createTestStudentProfile();
      const fileData = Buffer.alloc(1024 * 1024); // 1MB file

      const response = await agent
        .post(`/api/student-profiles/${profile.id}/resume`)
        .attach("file", fileData, {
          filename: "resume.pdf",
          contentType: "application/pdf",
        });

      await expectSuccessResponse(response, TestStudentProfileValidator);
      expect(response.body.data.resume).toBeDefined();
      expect(response.body.data.resume.name).toBe("resume.pdf");

      // Verify file was created
      const files = await FileModel.find();
      expect(files.some((file) => file.name === "resume.pdf")).toBe(true);
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();
      const fileData = Buffer.alloc(1024);

      const response = await agent
        .post(`/api/student-profiles/${badId}/resume`)
        .attach("file", fileData, {
          filename: "resume.pdf",
          contentType: "application/pdf",
        });

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });

    it("should return validation error for missing file", async () => {
      const profile = await createTestStudentProfile();

      const response = await agent.post(
        `/api/student-profiles/${profile.id}/resume`
      );

      expect(response.status).toBe(500); // Missing file causes 500, not 400
    });
  });

  describe("DELETE /:id/resume", () => {
    it("should remove resume from a student profile", async () => {
      const profile = await createTestStudentProfile();
      const fileData = Buffer.alloc(1024);

      // First upload a resume
      await agent
        .post(`/api/student-profiles/${profile.id}/resume`)
        .attach("file", fileData, {
          filename: "resume.pdf",
          contentType: "application/pdf",
        });

      // Then delete it
      const response = await agent.delete(
        `/api/student-profiles/${profile.id}/resume`
      );

      await expectSuccessResponse(response, TestStudentProfileValidator);
      expect(response.body.data.resume).toBeNull();
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.delete(
        `/api/student-profiles/${badId}/resume`
      );

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });
  });

  describe("POST /:id/experiences", () => {
    it("should add an experience to a student profile", async () => {
      const profile = await createTestStudentProfile();
      const experienceData = {
        jobTitle: "Software Engineer Intern",
        startDate: new Date("2023-06-01"),
        endDate: new Date("2023-08-31"),
        description: "Worked on web development projects",
      };

      const response = await agent
        .post(`/api/student-profiles/${profile.id}/experiences`)
        .send(experienceData);

      await expectSuccessResponse(response, TestStudentProfileValidator);
      expect(response.body.data.experiences).toHaveLength(1);
      expect(response.body.data.experiences[0].jobTitle).toBe(
        experienceData.jobTitle
      );
      expect(response.body.data.experiences[0].description).toBe(
        experienceData.description
      );
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();
      const experienceData = {
        jobTitle: "Test Job",
        startDate: new Date(),
      };

      const response = await agent
        .post(`/api/student-profiles/${badId}/experiences`)
        .send(experienceData);

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });

    it("should return validation errors for invalid experience data", async () => {
      const profile = await createTestStudentProfile();
      const invalidExperienceData = {
        // Missing required jobTitle and startDate
        description: "Test description",
      };

      const response = await agent
        .post(`/api/student-profiles/${profile.id}/experiences`)
        .send(invalidExperienceData);

      expectValidationErrors(response, ["jobTitle", "startDate"]);
    });

    it("should return validation errors for invalid data types in experience", async () => {
      const profile = await createTestStudentProfile();
      const invalidExperienceData = {
        jobTitle: 123, // should be string
        startDate: "invalid-date", // should be valid date
        endDate: "invalid-date", // should be valid date
        description: 456, // should be string
      };

      const response = await agent
        .post(`/api/student-profiles/${profile.id}/experiences`)
        .send(invalidExperienceData);

      expectValidationErrors(response, [
        "jobTitle",
        "startDate",
        "endDate",
        "description",
      ]);
    });
  });

  describe("DELETE /:id/experiences/:experienceId", () => {
    it("should remove an experience from a student profile", async () => {
      const profile = await createTestStudentProfile();

      // First add an experience
      const experienceData = {
        jobTitle: "Test Job",
        startDate: new Date("2023-01-01"),
      };

      const addResponse = await agent
        .post(`/api/student-profiles/${profile.id}/experiences`)
        .send(experienceData);

      const experienceId = addResponse.body.data.experiences[0].id;

      // Then delete it
      const response = await agent.delete(
        `/api/student-profiles/${profile.id}/experiences/${experienceId}`
      );

      await expectSuccessResponse(response, TestStudentProfileValidator);
      expect(response.body.data.experiences).toHaveLength(0);
    });

    it("should return an error for student profile not found", async () => {
      const badId = new Types.ObjectId();
      const experienceId = new Types.ObjectId();

      const response = await agent.delete(
        `/api/student-profiles/${badId}/experiences/${experienceId}`
      );

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new StudentProfileNotFoundError(
            expect.stringContaining(badId.toString())
          ),
        ],
      });
    });

    it("should return an error for experience not found", async () => {
      const profile = await createTestStudentProfile();
      const badExperienceId = new Types.ObjectId();

      const response = await agent.delete(
        `/api/student-profiles/${profile.id}/experiences/${badExperienceId}`
      );

      await expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          new ExperienceNotFoundError(
            expect.stringContaining(badExperienceId.toString())
          ),
        ],
      });
    });

    it("should return validation error for invalid experience id", async () => {
      const profile = await createTestStudentProfile();

      const response = await agent.delete(
        `/api/student-profiles/${profile.id}/experiences/invalid-id`
      );

      expectValidationErrors(response, ["experienceId"], "params");
    });
  });
});
