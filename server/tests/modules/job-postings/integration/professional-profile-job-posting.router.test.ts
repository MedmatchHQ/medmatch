import {
  createTestJobPosting,
  getJobPostingData,
} from "#/modules/job-postings/utils/job-posting.helpers";
import { TestJobPostingValidator } from "#/modules/job-postings/utils/job-posting.validators";
import { createTestProfessionalProfile } from "#/modules/professional-profiles/utils/professional-profile.helpers";
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
import { JobPostingModel } from "@/modules/job-postings/job-posting.model";
import { ProfessionalProfileCode } from "@/modules/professional-profiles/utils/professional-profile.errors";
import { Types } from "mongoose";
import TestAgent from "supertest/lib/agent";

describe("Professional Profile Job Posting Routes", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("endpoint authentication", () => {
    test.each<[HTTPMethod, string]>([
      ["get", "/api/professional-profiles/:id/job-postings"],
      ["post", "/api/professional-profiles/:id/job-postings"],
    ])("`%s %s` should require authentication", async (method, endpoint) => {
      await expectEndpointToRequireAuth(method, endpoint);
    });
  });

  describe("GET /:id/job-postings", () => {
    it("should return job postings for a specific professional profile", async () => {
      const company = await createTestProfessionalProfile();
      
      // Create job postings for this company
      const jobPosting1 = await createTestJobPosting({ companyRef: company.id });
      const jobPosting2 = await createTestJobPosting({ companyRef: company.id });
      
      // Create job posting for a different company
      await createTestJobPosting();

      const response = await agent.get(`/api/professional-profiles/${company.id}/job-postings`);

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toHaveLength(2);
      
      const ids = response.body.data.map((jp: any) => jp.id);
      expect(ids).toContain(jobPosting1.id);
      expect(ids).toContain(jobPosting2.id);
      
      // Verify all job postings belong to the correct company
      expect(response.body.data.every((jp: any) => jp.companyRef.id === company.id)).toBe(true);
    });

    it("should return empty array for professional profile with no job postings", async () => {
      const company = await createTestProfessionalProfile();

      const response = await agent.get(`/api/professional-profiles/${company.id}/job-postings`);

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toEqual([]);
    });

    it("should return an error for non-existent professional profile", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.get(`/api/professional-profiles/${badId}/job-postings`);

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

    it("should return validation error for invalid professional profile id", async () => {
      const response = await agent.get("/api/professional-profiles/invalid-id/job-postings");

      expectValidationErrors(response, ["id"], "params");
    });
  });

  describe("POST /:id/job-postings", () => {
    it("should create a job posting for a specific professional profile", async () => {
      const company = await createTestProfessionalProfile();
      const jobPostingData = await getJobPostingData();
      
      // Remove companyRef since it should be set automatically from the route
      delete (jobPostingData as any).companyRef;

      const response = await agent
        .post(`/api/professional-profiles/${company.id}/job-postings`)
        .send(jobPostingData);

      expectSuccessResponse(response, TestJobPostingValidator, undefined, { status: 201 });
      expect(response.body.data.companyRef.id).toBe(company.id);
      expect(response.body.data.jobTitle).toBe(jobPostingData.jobTitle);

      // Verify the job posting was created in the database
      const jobPosting = await JobPostingModel.findById(response.body.data.id);
      expect(jobPosting).toBeDefined();
      expect(jobPosting!.companyRef.toString()).toBe(company.id);
    });

    it("should override companyRef from request body with route parameter", async () => {
      const company = await createTestProfessionalProfile();
      const otherCompany = await createTestProfessionalProfile();
      const jobPostingData = await getJobPostingData();
      
      // Set companyRef to a different company - should be overridden
      jobPostingData.companyRef = otherCompany.id;

      const response = await agent
        .post(`/api/professional-profiles/${company.id}/job-postings`)
        .send(jobPostingData);

      expectSuccessResponse(response, TestJobPostingValidator, undefined, { status: 201 });
      // Should use the company from the route, not from the body
      expect(response.body.data.companyRef.id).toBe(company.id);
    });

    it("should return an error for non-existent professional profile", async () => {
      const badId = new Types.ObjectId();
      const jobPostingData = await getJobPostingData();
      delete (jobPostingData as any).companyRef;

      const response = await agent
        .post(`/api/professional-profiles/${badId}/job-postings`)
        .send(jobPostingData);

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

    it("should return validation errors for missing required fields", async () => {
      const company = await createTestProfessionalProfile();
      const invalidData = {
        jobTitle: "Test Job",
        // Missing required fields
      };

      const response = await agent
        .post(`/api/professional-profiles/${company.id}/job-postings`)
        .send(invalidData);

      expectValidationErrors(response, [
        "location",
        "numAccepted",
        "workType",
        "deadline",
        "about",
        "qualifications",
        "responsibilities",
      ]);
    });

    it("should return validation error for invalid professional profile id", async () => {
      const jobPostingData = await getJobPostingData();
      delete (jobPostingData as any).companyRef;

      const response = await agent
        .post("/api/professional-profiles/invalid-id/job-postings")
        .send(jobPostingData);

      expectValidationErrors(response, ["id"], "params");
    });

    it("should create job posting with default values", async () => {
      const company = await createTestProfessionalProfile();
      const jobPostingData = await getJobPostingData();
      delete (jobPostingData as any).companyRef;

      const response = await agent
        .post(`/api/professional-profiles/${company.id}/job-postings`)
        .send(jobPostingData);

      expectSuccessResponse(response, TestJobPostingValidator, undefined, { status: 201 });
      expect(response.body.data.numApplicants).toBe(0); // Should default to 0
      expect(response.body.data.postDate).toBeDefined(); // Should be auto-set
    });
  });
});
