import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const usePlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantsWithExams, setPlantsWithExams] = useState<Plant[]>([]);


  const addPlant = async (plant: Plant): Promise<void> => {
    if (!plant.name) {
      const msg = 'Please fill in all fields';
      toast.error(msg);
      return;
    }
    try {
      const result = await window.db.plants.add(plant);
      if (result.success) {
        await getPlants();
        await getPlantsWithExams();
        toast.success('Plant added successfully!');
      } else {
        const msg = result.error || 'Failed to add plant';
        toast.error(msg);
      }
    } catch {
      const msg = "Failed to add plant";
      toast.error(msg);
    }
  };

  const getPlants = async (): Promise<Plant[]> => {
    try {
      const result = await window.db.plants.get();
      if (result.success) {
        setPlants(result.plants || []);
        return result.plants || [];
      } else {
        const msg = result.error || 'Failed to fetch plants';
        toast.error(msg);
        return [];
      }
    } catch {
      const msg = "Failed to fetch plants";
      toast.error(msg);
      return [];
    }
  };

  const getPlantsWithExams = async (): Promise<Plant[]> => {
    try {
      const result = await window.db.plants.getWithExams();
      if (result.success) {
        setPlantsWithExams(result.plants || []);
        return result.plants || [];
      } else {
        const msg = result.error || 'Failed to fetch plants with exams';
        toast.error(msg);
        return [];
      }
    } catch {
      const msg = "Failed to fetch plants with exams";
      toast.error(msg);
      return [];
    }
  };

  const getPlantById = async (plantId: number): Promise<Plant | null> => {
    try {
      const result = await window.db.plants.getById(plantId);
      if (result.success) {
        return result.plant || null;
      } else {
        const msg = result.error || 'Failed to fetch plant';
        toast.error(msg);
        return null;
      }
    } catch {
      const msg = "Failed to fetch plant";
      toast.error(msg);
      return null;
    }
  };

  const getPlantByIdWithExams = async (plantId: number): Promise<Plant | null> => {
    try {
      const result = await window.db.plants.getByIdWithExams(plantId);
      if (result.success) {
        return result.plant || null;
      } else {
        const msg = result.error || 'Failed to fetch plant with exams';
        toast.error(msg);
        return null;
      }
    } catch {
      const msg = "Failed to fetch plant with exams";
      toast.error(msg);
      return null;
    }
  };

  const updatePlant = async (plant: Plant): Promise<void> => {
    if (!plant.name) {
      const msg = 'Please fill in all fields';
      toast.error(msg);
      return;
    }
    try {
      const result = await window.db.plants.update(plant);
      if (result.success) {
        await getPlants();
        await getPlantsWithExams();
        toast.success('Plant updated successfully!');
      } else {
        const msg = result.error || 'Failed to update plant';
        toast.error(msg);
      }
    } catch {
      const msg = "Failed to update plant";
      toast.error(msg);
    }
  };

  const deletePlant = async (plantId: number): Promise<void> => {
    try {
      const result = await window.db.plants.delete(plantId);
      if (result.success) {
        await getPlants();
        await getPlantsWithExams();
        toast.success('Plant deleted successfully!');
      } else {
        const msg = result.error || 'Failed to delete plant';
        toast.error(msg);
      }
    } catch {
      const msg = "Failed to delete plant";
      toast.error(msg);
    }
  };

  useEffect(() => {
    getPlants();
    getPlantsWithExams();
  }, []);

  return {
    plants,
    plantsWithExams,
    getPlantById,
    getPlantByIdWithExams,
    addPlant,
    updatePlant,
    deletePlant,
  };
};
