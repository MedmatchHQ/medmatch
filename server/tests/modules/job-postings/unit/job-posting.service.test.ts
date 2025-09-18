import { createTestJobPosting, getJobPostingData } from "#/modules/job-postings/utils/job-posting.helpers";
import { createTestProfessionalProfile } from "#/modules/professional-profiles/utils/professional-profile.helpers";
import { JobPostingService } from "@/modules/job-postings/job-posting.service";
import { JobPostingModel, JobStatus } from "@/modules/job-postings/job-posting.model";
import { JobPostingNotFoundError } from "@/modules/job-postings/utils/job-posting.errors";
import { ProfessionalProfileNotFoundError } from "@/modules/professional-profiles/utils/professional-profile.errors";
import { Types } from "mongoose";

describe("JobPostingService", () => {
  let jobPostingService: JobPostingService;

  beforeEach(() => {
    jobPostingService = new JobPostingService();
  });

  describe("getAllJobPostings", () => {
    it("should return all job postings with populated company references", async () => {
      const jobPosting1 = await createTestJobPosting();
      const jobPosting2 = await createTestJobPosting();

      const result = await jobPostingService.getAllJobPostings();

      expect(result).toHaveLength(2);
      expect(result.some(jp => jp.id === jobPosting1.id)).toBe(true);
      expect(result.some(jp => jp.id === jobPosting2.id)).toBe(true);
      
      // Verify company reference is populated
      expect(typeof result[0].companyRef).toBe("object");
      expect(result[0].companyRef).toHaveProperty("id");
      expect(result[0].companyRef).toHaveProperty("name");
    });

    it("should return empty array when no job postings exist", async () => {
      const result = await jobPostingService.getAllJobPostings();

      expect(result).toEqual([]);
    });
  });

  describe("getJobPostingsByCompany", () => {
    it("should return job postings for a specific company", async () => {
      const company1 = await createTestProfessionalProfile();
      const company2 = await createTestProfessionalProfile();
      
      const jobPosting1 = await createTestJobPosting({ companyRef: company1.id });
      const jobPosting2 = await createTestJobPosting({ companyRef: company1.id });
      await createTestJobPosting({ companyRef: company2.id }); // Different company

      const result = await jobPostingService.getJobPostingsByCompany(company1.id);

      expect(result).toHaveLength(2);
      expect(result.some(jp => jp.id === jobPosting1.id)).toBe(true);
      expect(result.some(jp => jp.id === jobPosting2.id)).toBe(true);
      expect(result.every(jp => typeof jp.companyRef === "object" && jp.companyRef.id === company1.id)).toBe(true);
    });

    it("should return empty array for company with no job postings", async () => {
      const company = await createTestProfessionalProfile();

      const result = await jobPostingService.getJobPostingsByCompany(company.id);

      expect(result).toEqual([]);
    });

    it("should throw ProfessionalProfileNotFoundError for non-existent company", async () => {
      const badId = new Types.ObjectId().toString();

      await expect(jobPostingService.getJobPostingsByCompany(badId))
        .rejects.toThrow(ProfessionalProfileNotFoundError);
    });
  });

  describe("getJobPostingById", () => {
    it("should return a job posting by id with populated company reference", async () => {
      const jobPosting = await createTestJobPosting();

      const result = await jobPostingService.getJobPostingById(jobPosting.id);

      expect(result.id).toBe(jobPosting.id);
      expect(result.jobTitle).toBe(jobPosting.jobTitle);
      expect(typeof result.companyRef).toBe("object");
      expect(result.companyRef).toHaveProperty("id");
    });

    it("should throw JobPostingNotFoundError for non-existent job posting", async () => {
      const badId = new Types.ObjectId().toString();

      await expect(jobPostingService.getJobPostingById(badId))
        .rejects.toThrow(JobPostingNotFoundError);
    });
  });

  describe("createJobPosting", () => {
    it("should create a new job posting with populated company reference", async () => {
      const jobPostingData = await getJobPostingData();

      const result = await jobPostingService.createJobPosting(jobPostingData);

      expect(result.id).toBeDefined();
      expect(result.jobTitle).toBe(jobPostingData.jobTitle);
      expect(result.numApplicants).toBe(0); // Should default to 0
      expect(typeof result.companyRef).toBe("object");
      
      // Verify it was saved to database
      const saved = await JobPostingModel.findById(result.id);
      expect(saved).toBeDefined();
    });

    it("should throw ProfessionalProfileNotFoundError for non-existent company", async () => {
      const jobPostingData = await getJobPostingData();
      jobPostingData.companyRef = new Types.ObjectId().toString();

      await expect(jobPostingService.createJobPosting(jobPostingData))
        .rejects.toThrow(ProfessionalProfileNotFoundError);
    });
  });

  describe("updateJobPosting", () => {
    it("should update an existing job posting", async () => {
      const jobPosting = await createTestJobPosting();
      const updateData = {
        jobTitle: "Updated Job Title",
        jobStatus: JobStatus.REVIEWING,
        skillsTags: ["React", "Node.js"],
      };

      const result = await jobPostingService.updateJobPosting(jobPosting.id, updateData);

      expect(result.id).toBe(jobPosting.id);
      expect(result.jobTitle).toBe(updateData.jobTitle);
      expect(result.jobStatus).toBe(updateData.jobStatus);
      expect(result.skillsTags).toEqual(updateData.skillsTags);
      
      // Verify database was updated
      const updated = await JobPostingModel.findById(jobPosting.id);
      expect(updated!.jobTitle).toBe(updateData.jobTitle);
    });

    it("should validate company reference when updating", async () => {
      const jobPosting = await createTestJobPosting();
      const updateData = {
        companyRef: new Types.ObjectId().toString(),
      };

      await expect(jobPostingService.updateJobPosting(jobPosting.id, updateData))
        .rejects.toThrow(ProfessionalProfileNotFoundError);
    });

    it("should throw JobPostingNotFoundError for non-existent job posting", async () => {
      const badId = new Types.ObjectId().toString();
      const updateData = { jobTitle: "Updated Title" };

      await expect(jobPostingService.updateJobPosting(badId, updateData))
        .rejects.toThrow(JobPostingNotFoundError);
    });
  });

  describe("deleteJobPosting", () => {
    it("should delete an existing job posting", async () => {
      const jobPosting = await createTestJobPosting();

      const result = await jobPostingService.deleteJobPosting(jobPosting.id);

      expect(result.id).toBe(jobPosting.id);
      
      // Verify it was deleted from database
      const deleted = await JobPostingModel.findById(jobPosting.id);
      expect(deleted).toBeNull();
    });

    it("should throw JobPostingNotFoundError for non-existent job posting", async () => {
      const badId = new Types.ObjectId().toString();

      await expect(jobPostingService.deleteJobPosting(badId))
        .rejects.toThrow(JobPostingNotFoundError);
    });
  });

  describe("incrementApplicants", () => {
    it("should increment the applicant count", async () => {
      const jobPosting = await createTestJobPosting();
      const initialCount = jobPosting.numApplicants;

      const result = await jobPostingService.incrementApplicants(jobPosting.id);

      expect(result.numApplicants).toBe(initialCount + 1);
      
      // Verify database was updated
      const updated = await JobPostingModel.findById(jobPosting.id);
      expect(updated!.numApplicants).toBe(initialCount + 1);
    });

    it("should throw JobPostingNotFoundError for non-existent job posting", async () => {
      const badId = new Types.ObjectId().toString();

      await expect(jobPostingService.incrementApplicants(badId))
        .rejects.toThrow(JobPostingNotFoundError);
    });
  });

  describe("updateJobStatus", () => {
    it("should update the job status", async () => {
      const jobPosting = await createTestJobPosting();
      const newStatus = JobStatus.CLOSED;

      const result = await jobPostingService.updateJobStatus(jobPosting.id, newStatus);

      expect(result.jobStatus).toBe(newStatus);
      
      // Verify database was updated
      const updated = await JobPostingModel.findById(jobPosting.id);
      expect(updated!.jobStatus).toBe(newStatus);
    });

    it("should throw JobPostingNotFoundError for non-existent job posting", async () => {
      const badId = new Types.ObjectId().toString();

      await expect(jobPostingService.updateJobStatus(badId, JobStatus.CLOSED))
        .rejects.toThrow(JobPostingNotFoundError);
    });
  });

  describe("searchJobPostingsBySkills", () => {
    it("should return job postings matching any of the provided skills", async () => {
      const jobPosting1 = await createTestJobPosting({
        skillsTags: ["JavaScript", "React", "Node.js"],
      });
      const jobPosting2 = await createTestJobPosting({
        skillsTags: ["Python", "Django", "PostgreSQL"],
      });
      const jobPosting3 = await createTestJobPosting({
        skillsTags: ["Java", "Spring", "MySQL"],
      });

      const result = await jobPostingService.searchJobPostingsBySkills(["JavaScript", "Python"]);

      expect(result).toHaveLength(2);
      expect(result.some(jp => jp.id === jobPosting1.id)).toBe(true);
      expect(result.some(jp => jp.id === jobPosting2.id)).toBe(true);
      expect(result.some(jp => jp.id === jobPosting3.id)).toBe(false);
    });

    it("should return empty array when no skills match", async () => {
      await createTestJobPosting({
        skillsTags: ["Python", "Django"],
      });

      const result = await jobPostingService.searchJobPostingsBySkills(["Java", "C++"]);

      expect(result).toEqual([]);
    });

    it("should handle empty skills array", async () => {
      await createTestJobPosting();

      const result = await jobPostingService.searchJobPostingsBySkills([]);

      expect(result).toEqual([]);
    });
  });

  describe("searchJobPostingsByLocation", () => {
    it("should return job postings matching location (case-insensitive)", async () => {
      const jobPosting1 = await createTestJobPosting({
        location: "San Francisco, CA",
      });
      const jobPosting2 = await createTestJobPosting({
        location: "New York, NY",
      });
      const jobPosting3 = await createTestJobPosting({
        location: "San Jose, CA",
      });

      const result = await jobPostingService.searchJobPostingsByLocation("san");

      expect(result).toHaveLength(2);
      expect(result.some(jp => jp.id === jobPosting1.id)).toBe(true);
      expect(result.some(jp => jp.id === jobPosting3.id)).toBe(true);
      expect(result.some(jp => jp.id === jobPosting2.id)).toBe(false);
    });

    it("should return empty array when no locations match", async () => {
      await createTestJobPosting({
        location: "Boston, MA",
      });

      const result = await jobPostingService.searchJobPostingsByLocation("seattle");

      expect(result).toEqual([]);
    });

    it("should perform partial matches", async () => {
      await createTestJobPosting({
        location: "Los Angeles, CA",
      });

      const result = await jobPostingService.searchJobPostingsByLocation("Angeles");

      expect(result).toHaveLength(1);
    });
  });
});
