import { createTestJobPosting, getJobPostingData } from "#/modules/job-postings/utils/job-posting.helpers";
import { expectControllerSuccessResponse } from "#/utils/helpers";
import { JobPostingController } from "@/modules/job-postings/job-posting.controller";
import { JobPostingService } from "@/modules/job-postings/job-posting.service";
import { JobPostingNotFoundError } from "@/modules/job-postings/utils/job-posting.errors";
import { Request, Response } from "express";
import { Types } from "mongoose";

// Mock the service
jest.mock("@/modules/job-postings/job-posting.service");

describe("JobPostingController", () => {
  let jobPostingController: JobPostingController;
  let mockJobPostingService: jest.Mocked<JobPostingService>;
  let mockRequest: Partial<Request>;
  let mockResponse: jest.Mocked<Response>;

  beforeEach(() => {
    mockJobPostingService = new JobPostingService() as jest.Mocked<JobPostingService>;
    jobPostingController = new JobPostingController(mockJobPostingService);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
  });

  describe("getAllJobPostings", () => {
    it("should return all job postings", async () => {
      const jobPostings = [await createTestJobPosting(), await createTestJobPosting()];
      mockJobPostingService.getAllJobPostings.mockResolvedValue(jobPostings);

      await jobPostingController.getAllJobPostings(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.getAllJobPostings).toHaveBeenCalledWith();
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: jobPostings,
        message: "Job postings retrieved successfully",
      });
    });
  });

  describe("getJobPostingsByCompany", () => {
    it("should return job postings for a specific company", async () => {
      const companyId = new Types.ObjectId().toString();
      const jobPostings = [await createTestJobPosting()];
      
      mockRequest.params = { companyId };
      mockJobPostingService.getJobPostingsByCompany.mockResolvedValue(jobPostings);

      await jobPostingController.getJobPostingsByCompany(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.getJobPostingsByCompany).toHaveBeenCalledWith(companyId);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: jobPostings,
        message: `Job postings for company ${companyId} retrieved successfully`,
      });
    });
  });

  describe("getJobPostingById", () => {
    it("should return a job posting by id", async () => {
      const jobPosting = await createTestJobPosting();
      
      mockRequest.params = { id: jobPosting.id };
      mockJobPostingService.getJobPostingById.mockResolvedValue(jobPosting);

      await jobPostingController.getJobPostingById(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.getJobPostingById).toHaveBeenCalledWith(jobPosting.id);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: jobPosting,
        message: `Job posting with id ${jobPosting.id} retrieved successfully`,
      });
    });
  });

  describe("createJobPosting", () => {
    it("should create a new job posting", async () => {
      const jobPostingData = await getJobPostingData();
      const createdJobPosting = await createTestJobPosting();
      
      mockRequest.body = jobPostingData;
      mockJobPostingService.createJobPosting.mockResolvedValue(createdJobPosting);

      await jobPostingController.createJobPosting(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.createJobPosting).toHaveBeenCalledWith(jobPostingData);
      expectControllerSuccessResponse(mockResponse, {
        status: 201,
        data: createdJobPosting,
        message: `Job posting with id ${createdJobPosting.id} created successfully`,
      });
    });
  });

  describe("updateJobPosting", () => {
    it("should update an existing job posting", async () => {
      const jobPosting = await createTestJobPosting();
      const updateData = { jobTitle: "Updated Job Title" };
      const updatedJobPosting = { ...jobPosting, ...updateData };
      
      mockRequest.params = { id: jobPosting.id };
      mockRequest.body = updateData;
      mockJobPostingService.updateJobPosting.mockResolvedValue(updatedJobPosting);

      await jobPostingController.updateJobPosting(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.updateJobPosting).toHaveBeenCalledWith(jobPosting.id, updateData);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: updatedJobPosting,
        message: `Job posting with id ${jobPosting.id} updated successfully`,
      });
    });
  });

  describe("deleteJobPosting", () => {
    it("should delete a job posting", async () => {
      const jobPosting = await createTestJobPosting();
      
      mockRequest.params = { id: jobPosting.id };
      mockJobPostingService.deleteJobPosting.mockResolvedValue(jobPosting);

      await jobPostingController.deleteJobPosting(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.deleteJobPosting).toHaveBeenCalledWith(jobPosting.id);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: jobPosting,
        message: `Job posting with id ${jobPosting.id} deleted successfully`,
      });
    });
  });

  describe("incrementApplicants", () => {
    it("should increment applicant count", async () => {
      const jobPosting = await createTestJobPosting();
      const updatedJobPosting = { ...jobPosting, numApplicants: jobPosting.numApplicants + 1 };
      
      mockRequest.params = { id: jobPosting.id };
      mockJobPostingService.incrementApplicants.mockResolvedValue(updatedJobPosting);

      await jobPostingController.incrementApplicants(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.incrementApplicants).toHaveBeenCalledWith(jobPosting.id);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: updatedJobPosting,
        message: `Applicant count incremented for job posting with id ${jobPosting.id}`,
      });
    });
  });

  describe("updateJobStatus", () => {
    it("should update job status", async () => {
      const jobPosting = await createTestJobPosting();
      const newStatus = "closed";
      const updatedJobPosting = { ...jobPosting, jobStatus: newStatus };
      
      mockRequest.params = { id: jobPosting.id };
      mockRequest.body = { status: newStatus };
      mockJobPostingService.updateJobStatus.mockResolvedValue(updatedJobPosting as any);

      await jobPostingController.updateJobStatus(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.updateJobStatus).toHaveBeenCalledWith(jobPosting.id, newStatus);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: updatedJobPosting,
        message: `Job status updated for job posting with id ${jobPosting.id}`,
      });
    });
  });

  describe("searchJobPostingsBySkills", () => {
    it("should search job postings by skills", async () => {
      const jobPostings = [await createTestJobPosting()];
      const skills = "JavaScript,TypeScript,React";
      
      mockRequest.query = { skills };
      mockJobPostingService.searchJobPostingsBySkills.mockResolvedValue(jobPostings);

      await jobPostingController.searchJobPostingsBySkills(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.searchJobPostingsBySkills).toHaveBeenCalledWith([
        "JavaScript",
        "TypeScript", 
        "React"
      ]);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: jobPostings,
        message: "Job postings matching skills retrieved successfully",
      });
    });

    it("should handle empty skills query", async () => {
      mockRequest.query = {};
      mockJobPostingService.searchJobPostingsBySkills.mockResolvedValue([]);

      await jobPostingController.searchJobPostingsBySkills(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.searchJobPostingsBySkills).toHaveBeenCalledWith([]);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: [],
        message: "Job postings matching skills retrieved successfully",
      });
    });

    it("should handle skills with extra whitespace", async () => {
      const jobPostings = [await createTestJobPosting()];
      const skills = " JavaScript , TypeScript , React ";
      
      mockRequest.query = { skills };
      mockJobPostingService.searchJobPostingsBySkills.mockResolvedValue(jobPostings);

      await jobPostingController.searchJobPostingsBySkills(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.searchJobPostingsBySkills).toHaveBeenCalledWith([
        "JavaScript",
        "TypeScript", 
        "React"
      ]);
    });
  });

  describe("searchJobPostingsByLocation", () => {
    it("should search job postings by location", async () => {
      const jobPostings = [await createTestJobPosting()];
      const location = "San Francisco";
      
      mockRequest.query = { location };
      mockJobPostingService.searchJobPostingsByLocation.mockResolvedValue(jobPostings);

      await jobPostingController.searchJobPostingsByLocation(mockRequest as Request, mockResponse);

      expect(mockJobPostingService.searchJobPostingsByLocation).toHaveBeenCalledWith(location);
      expectControllerSuccessResponse(mockResponse, {
        status: 200,
        data: jobPostings,
        message: `Job postings in location "${location}" retrieved successfully`,
      });
    });

    it("should return error for missing location parameter", async () => {
      mockRequest.query = {};

      await jobPostingController.searchJobPostingsByLocation(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        errors: [{
          type: "validation",
          loc: "query",
          field: "location",
          details: "Location query parameter is required",
        }],
      });
    });

    it("should return error for empty location parameter", async () => {
      mockRequest.query = { location: "" };

      await jobPostingController.searchJobPostingsByLocation(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        errors: [{
          type: "validation",
          loc: "query",
          field: "location",
          details: "Location query parameter is required",
        }],
      });
    });

    it("should return error for non-string location parameter", async () => {
      mockRequest.query = { location: 123 as any };

      await jobPostingController.searchJobPostingsByLocation(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        errors: [{
          type: "validation",
          loc: "query",
          field: "location",
          details: "Location query parameter is required",
        }],
      });
    });
  });
});
