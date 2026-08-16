import { SportCreateService } from "./sport-create.service";
import { SportUpdateService } from "./sport-update.service";
import { SportQueryService } from "./sport-query.service";
import { SportDeleteService } from "./sport-delete.service";

import {
  CreateSportInput,
  UpdateSportInput,
} from "@/lib/validators/sport";

export class SportService {
  /**
   * ==========================================
   * Create Sport
   * ==========================================
   */
  static async createSport(
    data: CreateSportInput
  ) {
    return SportCreateService.create(
      data
    );
  }

  /**
 * ==========================================
 * Get all active sports
 * ==========================================
 */
static async getAllSports() {
  return SportQueryService.getAllSports();
}
/**
 * ==========================================
 * Get Sport By ID
 * ==========================================
 */
static async getSportById(
  id: string
) {
  return SportQueryService.getSportById(
    id
  );
}

  /**
   * ==========================================
   * Get Sport By Slug
   * ==========================================
   */
  static async getSportBySlug(
    slug: string
  ) {
    return SportQueryService.getSportBySlug(
      slug
    );
  }

  /**
   * ==========================================
   * Update Sport
   * ==========================================
   */
  static async updateSport(
    sportId: string,
    data: UpdateSportInput
  ) {
    return SportUpdateService.update(
      sportId,
      data
    );
  }

  /**
   * ==========================================
   * Delete Sport
   * ==========================================
   */
  static async deleteSport(
    sportId: string
  ) {
    return SportDeleteService.delete(
      sportId
    );
  }
}