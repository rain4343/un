import { Injectable } from "@nestjs/common";
import { getDb, type AppDatabase } from "../../src/db";

@Injectable()
export class DatabaseService {
  get client(): AppDatabase {
    return getDb();
  }

  isConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL);
  }
}
