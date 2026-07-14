import express from "express";
import type { Request, Response } from "express";
import { DB } from "@/db";
import {
  LandlordQuestionnaire,
  TenantQuestionnaire,
  Property,
  User,
} from "@/entities";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = express.Router();

router.post(
  "/landlord/create",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log(req.body);

    const { id, name, creationDate, landlordId, questions } = req.body;
    try {
      const questionnaire = DB.em.create(LandlordQuestionnaire, {
        id: id,
        name: name,
        creationDate: creationDate,
        landlordId: landlordId,
        questions: questions,
      });

      await DB.em.persistAndFlush(questionnaire);

      res.status(201).json(questionnaire);
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      res
        .status(500)
        .json({ message: "An error occurred while creating questionnaires." });
    }
  }
);

router.get(
  "/landlord/:landlordId",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { landlordId } = req.params;

    try {
      const questionnaires = await DB.em.find(LandlordQuestionnaire, {
        landlordId,
      });

      const questionnaireDetails = questionnaires.length
        ? questionnaires.map((q) => ({
            id: q.id,
            name: q.name,
          }))
        : [];

      res.status(200).json(questionnaireDetails);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching questionnaires." });
    }
  }
);

router.get(
  "/landlord/get/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const questionnaire = await DB.em.findOne(LandlordQuestionnaire, { id });

      if (!questionnaire) {
        res
          .status(404)
          .json({ message: "Questionnaire not found for this ID." });
        return;
      }

      res.status(200).json(questionnaire);
      return;
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      res
        .status(500)
        .json({
          message: "An error occurred while fetching the questionnaire.",
        });
      return;
    }
  }
);

router.post(
  "/tenant/submit",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { landlordQuestionnaireId, userId, propertyId, answers } = req.body;

      if (
        !landlordQuestionnaireId ||
        !userId ||
        !propertyId ||
        !Array.isArray(answers)
      ) {
        res.status(400).json({ error: "Invalid input data." });
        return;
      }

      const landlordQuestionnaire = await DB.em.findOne(LandlordQuestionnaire, {
        id: landlordQuestionnaireId,
      });

      if (!landlordQuestionnaire) {
        res.status(404).json({ error: "Landlord questionnaire not found." });
        return;
      }

      if (answers.length !== landlordQuestionnaire.questions.length) {
        res.status(400).json({
          error: "Answers count does not match the number of questions.",
        });
        return;
      }

      // Calculate tenant score
      let tenantScore = 0;
      landlordQuestionnaire.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswerIndex) {
          tenantScore += question.score;
        }
      });

      const tenantQuestionnaire = DB.em.create(TenantQuestionnaire, {
        landlordQuestionnaireId,
        userId,
        propertyId,
        answers,
        tenantScore,
        creationDate: new Date(),
      });

      await DB.em.persistAndFlush(tenantQuestionnaire);

      res.status(201).json({
        message: "Tenant questionnaire submitted successfully.",
        tenantQuestionnaire,
      });
    } catch (error) {
      console.error("Error submitting tenant questionnaire:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// API: Check if tenant has taken the questionnaire
router.get(
  "/tenant/:propertyId/:userId",
  authenticateToken,
  async (req, res) => {
    const { propertyId, userId } = req.params;

    try {
      if (!propertyId || !userId) {
        res
          .status(400)
          .json({ error: "Property ID and User ID are required." });
        return;
      }

      const questionnaire = await DB.em.findOne(TenantQuestionnaire, {
        propertyId: propertyId,
        userId: userId,
      });

      if (questionnaire) {
        res.json({ hasTaken: true });
        return;
      }
      res.json({ hasTaken: false });
      return;
    } catch (error) {
      console.error("Error checking questionnaire status:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  }
);

router.get(
  "/landlord/properties/:propertyId/tenants",
  authenticateToken,
  async (req, res) => {
    const { propertyId } = req.params;

    try {
      const property = await DB.em.findOne(Property, { id: propertyId });

      if (!property) {
        res.status(404).json({ error: "Property not found." });
        return;
      }

      const tenantQuestionnaires = await DB.em.find(TenantQuestionnaire, {
        propertyId: propertyId,
      });
      if (tenantQuestionnaires.length === 0) {
        res.status(200).json({
          propertyId: propertyId,
          propertyName: property.name,
          tenants: [],
        });
        return;
      }
      const userIds = tenantQuestionnaires.map((tenant) => tenant.userId);
      const users = await DB.em.find(User, { id: { $in: userIds } });

      const userMap = new Map(
        users.map((user) => [user.id, `${user.firstName} ${user.lastName}`])
      );

      const tenantsWithDetails = tenantQuestionnaires.map((tenant) => ({
        name: userMap.get(tenant.userId) || "Unknown User",
        tenantScore: tenant.tenantScore,
      }));

      res.status(200).json({
        propertyId: propertyId,
        propertyName: property.name,
        tenants: tenantsWithDetails,
      });
    } catch (err) {
      console.error("Error fetching tenants:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching tenants." });
    }
  }
);

export const questionnaireRouter = router;
