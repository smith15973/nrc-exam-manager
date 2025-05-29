// db/repositories/PlantRepository.ts
import sqlite3 from 'sqlite3';

export class PlantRepository {
  constructor(private db: sqlite3.Database, private isClosing: () => boolean) {}

  async add(plant: Plant): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.run(
        'INSERT INTO plants (name) VALUES (?)',
        [plant.name],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getAll(): Promise<Plant[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      this.db.all('SELECT * FROM plants', [], (err, rows: Plant[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getAllWithExams(): Promise<Plant[]> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
        SELECT
          p.*,
          e.exam_id,
          e.name as exam_name,
          e.plant_id as exam_plant_id
        FROM plants p
        LEFT JOIN exams e ON p.plant_id = e.plant_id
        ORDER BY p.plant_id, e.exam_id
      `;

      this.db.all(query, [], (err, rows: any) => {
        if (err) {
          reject(err);
        } else {
          const plantsMap = new Map<number, Plant>();

          rows.forEach((row: any) => {
            const plantId = row.plant_id;

            // Add plant to map if not already added
            if (!plantsMap.has(plantId)) {
              plantsMap.set(plantId, {
                plant_id: plantId,
                name: row.name,
                exams: []
              });
            }

            const plant = plantsMap.get(plantId)!;

            // Add exam if it exists (LEFT JOIN might have null exam data)
            if (row.exam_id) {
              plant.exams!.push({
                exam_id: row.exam_id,
                name: row.exam_name,
                plant_id: row.exam_plant_id
              });
            }
          });

          // Convert map to array
          const plants = Array.from(plantsMap.values());
          resolve(plants);
        }
      });
    });
  }

  async getById(plantId: number): Promise<Plant> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.get("SELECT * FROM plants WHERE plant_id = ?", [plantId], (err, row: Plant) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Plant not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  async getByIdWithExams(plantId: number): Promise<Plant> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error('Database is closing'));
        return;
      }

      const query = `
        SELECT
          p.*,
          e.exam_id,
          e.name as exam_name,
          e.plant_id as exam_plant_id
        FROM plants p
        LEFT JOIN exams e ON p.plant_id = e.plant_id
        WHERE p.plant_id = ?
      `;

      this.db.all(query, [plantId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else if (!rows || rows.length === 0) {
          reject(new Error('Plant not found'));
        } else {
          const row: any = rows[0];
          const plant: Plant = {
            plant_id: row.plant_id,
            name: row.name,
            exams: rows
              .filter(row => row.exam_id) // Only include rows with actual exams
              .map(row => ({
                exam_id: row.exam_id,
                name: row.exam_name,
                plant_id: row.exam_plant_id
              }))
          };

          resolve(plant);
        }
      });
    });
  }

  async update(plant: Plant): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      if (!plant.plant_id) {
        reject(new Error('Plant ID is required for update'));
        return;
      }

      this.db.run(
        'UPDATE plants SET name = ? WHERE plant_id = ?',
        [plant.name, plant.plant_id],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Plant not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async delete(plantId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isClosing()) {
        reject(new Error("Database is closing"));
        return;
      }

      this.db.run(
        'DELETE FROM plants WHERE plant_id = ?',
        [plantId],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Plant not found'));
          } else {
            resolve();
          }
        }
      );
    });
  }
}