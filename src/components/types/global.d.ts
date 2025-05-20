// src/renderer/global.d.ts
interface Plant {
  plant_id?: number;
  name: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
}

interface PlantResponse extends ApiResponse {
  plantId: number;
  plant?: Plant;
  plants?: Plant[];
}

interface Window {
  api: {
    // plant operations
    addPlant: (plant: Plant) => Promise<PlantResponse>;
    getPlants: () => Promise<PlantResponse>;
    getPlant: (plantId: number) => Promise<PlantResponse>;
    updatePlant: (plant: Plant) => Promise<PlantResponse>;
    deletePlant: (plantId: number) => Promise<PlantResponse>;
  };
}