import {
  createTestJobPosting,
  createTestJobPostingsForCompany,
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
import {
  JobPosting,
  JobPostingModel,
  JobStatus,
  WorkType,
  HoursType,
} from "@/modules/job-postings/job-posting.model";
import { JobPostingCode } from "@/modules/job-postings/utils/job-posting.errors";
import { ProfessionalProfileCode } from "@/modules/professional-profiles/utils/professional-profile.errors";
import { Types } from "mongoose";
import TestAgent from "supertest/lib/agent";

describe("Job Posting Router", () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = getAuthenticatedAgent();
  });

  describe("endpoint authentication", () => {
    test.each<[HTTPMethod, string]>([
      ["get", "/api/job-postings"],
      ["get", "/api/job-postings/:id"],
      ["post", "/api/job-postings"],
      ["patch", "/api/job-postings/:id"],
      ["delete", "/api/job-postings/:id"],
      ["get", "/api/job-postings/company/:companyId"],
      ["post", "/api/job-postings/:id/apply"],
      ["patch", "/api/job-postings/:id/status"],
      ["get", "/api/job-postings/search/skills"],
      ["get", "/api/job-postings/search/location"],
    ])("`%s %s` should require authentication", async (method, endpoint) => {
      await expectEndpointToRequireAuth(method, endpoint);
    });
  });

  describe("GET /", () => {
    it("should return an empty list when there are no job postings", async () => {
      const response = await agent.get("/api/job-postings");

      expectSuccessResponse(response);
      expect(response.body.data).toEqual([]);
    });

    it("should return all job postings with populated company references", async () => {
      const jobPosting = await createTestJobPosting();

      const response = await agent.get("/api/job-postings");

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(jobPosting.id);
      expect(response.body.data[0].companyRef).toHaveProperty("id");
      expect(response.body.data[0].companyRef).toHaveProperty("name");
    });
  });

  describe("GET /company/:companyId", () => {
    it("should return job postings for a specific company", async () => {
      const company = await createTestProfessionalProfile();
      const jobPostings = await createTestJobPostingsForCompany(company.id, 2);
      
      // Create a job posting for a different company
      await createTestJobPosting();

      const response = await agent.get(`/api/job-postings/company/${company.id}`);

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((jp: any) => jp.companyRef.id === company.id)).toBe(true);
    });

    it("should return empty array for company with no job postings", async () => {
      const company = await createTestProfessionalProfile();

      const response = await agent.get(`/api/job-postings/company/${company.id}`);

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toEqual([]);
    });

    it("should return an error for non-existent company", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.get(`/api/job-postings/company/${badId}`);

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

  describe("GET /:id", () => {
    it("should return a job posting by id with populated company reference", async () => {
      const jobPosting = await createTestJobPosting();

      const response = await agent.get(`/api/job-postings/${jobPosting.id}`);

      expectSuccessResponse(response, TestJobPostingValidator);
      expect(response.body.data.id).toBe(jobPosting.id);
      expect(response.body.data.companyRef).toHaveProperty("id");
    });

    it("should return an error for job posting not found", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.get(`/api/job-postings/${badId}`);

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: JobPostingCode.JobPostingNotFound,
          },
        ],
      });
    });

    it("should return validation error for invalid id format", async () => {
      const response = await agent.get("/api/job-postings/invalid-id");

      expectValidationErrors(response, ["id"], "params");
    });
  });

  describe("POST /", () => {
    it("should create a new job posting", async () => {
      const jobPostingData = await getJobPostingData();

      const response = await agent
        .post("/api/job-postings")
        .send(jobPostingData);

      expect(response.body.data).toBeDefined();
      const jobPosting = await JobPostingModel.findById(response.body.data.id);
      expect(jobPosting).toBeDefined();
      expectSuccessResponse(
        response,
        TestJobPostingValidator,
        undefined,
        { status: 201 }
      );
      expect(response.body.data.jobTitle).toBe(jobPostingData.jobTitle);
      expect(response.body.data.numApplicants).toBe(0); // Should default to 0
    });

    it("should return validation errors for missing required fields", async () => {
      const invalidData = {
        jobTitle: "Test Job",
        // Missing required fields: companyRef, numAccepted, workType, etc.
      };

      const response = await agent
        .post("/api/job-postings")
        .send(invalidData);

      expectValidationErrors(response, [
        "companyRef",
        "location",
        "numAccepted",
        "workType",
        "deadline",
        "about",
        "qualifications",
        "responsibilities",
      ]);
    });

    it("should return error for non-existent company reference", async () => {
      const jobPostingData = await getJobPostingData();
      jobPostingData.companyRef = new Types.ObjectId().toString();

      const response = await agent
        .post("/api/job-postings")
        .send(jobPostingData);

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(jobPostingData.companyRef),
            code: ProfessionalProfileCode.ProfessionalProfileNotFound,
          },
        ],
      });
    });

    it("should create job posting with all optional fields", async () => {
      const jobPostingData = await getJobPostingData();
      jobPostingData.hours = {
        type: HoursType.SPECIFIC_HOURS,
        specificHours: 20,
      };

      const response = await agent
        .post("/api/job-postings")
        .send(jobPostingData);

      expectSuccessResponse(response, TestJobPostingValidator, undefined, { status: 201 });
      expect(response.body.data.hours.type).toBe(HoursType.SPECIFIC_HOURS);
      expect(response.body.data.hours.specificHours).toBe(20);
    });
  });

  describe("PATCH /:id", () => {
    it("should update an existing job posting", async () => {
      const jobPosting = await createTestJobPosting();
      const updateData = {
        jobTitle: "Updated Job Title",
        jobStatus: JobStatus.REVIEWING,
        skillsTags: ["React", "Node.js", "MongoDB"],
      };

      const response = await agent
        .patch(`/api/job-postings/${jobPosting.id}`)
        .send(updateData);

      expectSuccessResponse(response, TestJobPostingValidator);
      expect(response.body.data.jobTitle).toBe(updateData.jobTitle);
      expect(response.body.data.jobStatus).toBe(updateData.jobStatus);
      expect(response.body.data.skillsTags).toEqual(updateData.skillsTags);

      const updatedJobPosting = await JobPostingModel.findById(jobPosting.id);
      expect(updatedJobPosting!.jobTitle).toBe(updateData.jobTitle);
    });

    it("should return an error for job posting not found", async () => {
      const badId = new Types.ObjectId();
      const updateData = { jobTitle: "Updated Title" };

      const response = await agent
        .patch(`/api/job-postings/${badId}`)
        .send(updateData);

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: JobPostingCode.JobPostingNotFound,
          },
        ],
      });
    });
  });

  describe("DELETE /:id", () => {
    it("should delete an existing job posting", async () => {
      const jobPosting1 = await createTestJobPosting();
      const jobPosting2 = await createTestJobPosting();

      const response = await agent.delete(`/api/job-postings/${jobPosting1.id}`);

      expectSuccessResponse(response, TestJobPostingValidator);
      const jobPostings = await JobPostingModel.find();
      expect(jobPostings.length).toBe(1);
      expect(jobPostings[0]!.id).toEqual(jobPosting2.id);
    });

    it("should return an error for job posting not found", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.delete(`/api/job-postings/${badId}`);

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: JobPostingCode.JobPostingNotFound,
          },
        ],
      });
    });
  });

  describe("POST /:id/apply", () => {
    it("should increment the applicant count", async () => {
      const jobPosting = await createTestJobPosting();
      const initialCount = jobPosting.numApplicants;

      const response = await agent.post(`/api/job-postings/${jobPosting.id}/apply`);

      expectSuccessResponse(response, TestJobPostingValidator);
      expect(response.body.data.numApplicants).toBe(initialCount + 1);

      const updatedJobPosting = await JobPostingModel.findById(jobPosting.id);
      expect(updatedJobPosting!.numApplicants).toBe(initialCount + 1);
    });

    it("should return an error for non-existent job posting", async () => {
      const badId = new Types.ObjectId();

      const response = await agent.post(`/api/job-postings/${badId}/apply`);

      expectHttpErrorResponse(response, {
        status: 404,
        errors: [
          {
            details: expect.stringContaining(badId.toString()),
            code: JobPostingCode.JobPostingNotFound,
          },
        ],
      });
    });
  });

  describe("PATCH /:id/status", () => {
    it("should update the job status", async () => {
      const jobPosting = await createTestJobPosting();
      const newStatus = JobStatus.CLOSED;

      const response = await agent
        .patch(`/api/job-postings/${jobPosting.id}/status`)
        .send({ status: newStatus });

      expectSuccessResponse(response, TestJobPostingValidator);
      expect(response.body.data.jobStatus).toBe(newStatus);

      const updatedJobPosting = await JobPostingModel.findById(jobPosting.id);
      expect(updatedJobPosting!.jobStatus).toBe(newStatus);
    });

    it("should return validation error for missing status", async () => {
      const jobPosting = await createTestJobPosting();

      const response = await agent
        .patch(`/api/job-postings/${jobPosting.id}/status`)
        .send({});

      expectValidationErrors(response, ["status"]);
    });
  });

  describe("GET /search/skills", () => {
    it("should return job postings matching skills", async () => {
      const jobPosting1 = await createTestJobPosting({
        skillsTags: ["JavaScript", "React", "Node.js"],
      });
      const jobPosting2 = await createTestJobPosting({
        skillsTags: ["Python", "Django", "PostgreSQL"],
      });
      const jobPosting3 = await createTestJobPosting({
        skillsTags: ["JavaScript", "Vue.js", "MongoDB"],
      });

      const response = await agent.get(
        "/api/job-postings/search/skills?skills=JavaScript,Python"
      );

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toHaveLength(3); // All should match
      
      const ids = response.body.data.map((jp: any) => jp.id);
      expect(ids).toContain(jobPosting1.id);
      expect(ids).toContain(jobPosting2.id);
      expect(ids).toContain(jobPosting3.id);
    });

    it("should return empty array when no skills match", async () => {
      await createTestJobPosting({
        skillsTags: ["Python", "Django"],
      });

      const response = await agent.get(
        "/api/job-postings/search/skills?skills=Java,C++"
      );

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toEqual([]);
    });

    it("should handle empty skills query", async () => {
      await createTestJobPosting();

      const response = await agent.get("/api/job-postings/search/skills");

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /search/location", () => {
    it("should return job postings matching location", async () => {
      const jobPosting1 = await createTestJobPosting({
        location: "San Francisco, CA",
      });
      const jobPosting2 = await createTestJobPosting({
        location: "New York, NY",
      });
      const jobPosting3 = await createTestJobPosting({
        location: "San Jose, CA",
      });

      const response = await agent.get(
        "/api/job-postings/search/location?location=San"
      );

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toHaveLength(2);
      
      const ids = response.body.data.map((jp: any) => jp.id);
      expect(ids).toContain(jobPosting1.id);
      expect(ids).toContain(jobPosting3.id);
    });

    it("should return error for missing location parameter", async () => {
      const response = await agent.get("/api/job-postings/search/location");

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.errors[0].details).toContain("Location query parameter is required");
    });

    it("should perform case-insensitive search", async () => {
      await createTestJobPosting({
        location: "Boston, MA",
      });

      const response = await agent.get(
        "/api/job-postings/search/location?location=BOSTON"
      );

      expectSuccessResponse(response, [TestJobPostingValidator]);
      expect(response.body.data).toHaveLength(1);
    });
  });
});
