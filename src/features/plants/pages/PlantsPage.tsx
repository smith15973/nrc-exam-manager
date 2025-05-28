import PlantForm from '../components/PlantForm';
import PlantsList from '../components/PlantsList';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { defaultPlant } from '../../../data/db/schema';


export default function PlantsPage() {
    const { plants } = useDatabase();
    const [plantList, setPlantList] = useState<Plant[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Plant>>(
        defaultPlant
    );

    useEffect(() => {
        loadPlantsWithExams();
    }, [])

    // ===== READ OPERATIONS =====
    const loadPlants = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await plants.getAll();
            if (result.success) {
                setPlantList(result.data || []);
            } else {
                setError(result.error || 'Failed to load plants');
            }
        } catch (err) {
            setError('Error loading plants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadPlantById = async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            const result = await plants.getById(id);
            if (result.success) {
                setSelectedPlant(result.data);
                setFormData(result.data);
            } else {
                setError(result.error || 'Failed to load plant');
            }
        } catch (err) {
            setError('Error loading plant');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadPlantsWithExams = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await plants.getAllWithExams();
            if (result.success) {
                setPlantList(result.data || []);
            } else {
                setError(result.error || 'Failed to load plants with exams');
            }
        } catch (err) {
            setError('Error loading plants with exams');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlant = async () => {
        if (!formData.name?.trim()) {
            setError('Plant name is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await plants.create(formData as Plant);
            if (result.success) {
                // Refresh the list
                await loadPlants();
                // Reset form
                setFormData({ name: '' });
                setError(null);
                alert('Plant created successfully!');
            } else {
                setError(result.error || 'Failed to create plant');
            }
        } catch (err) {
            setError('Error creating plant');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ===== DELETE OPERATION =====
    const handleDeletePlant = async (id: number) => {
        if (!confirm('Are you sure you want to delete this plant?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await plants.delete(id);
            if (result.success) {
                // Refresh the list
                await loadPlants();
                // Clear selection if deleted plant was selected
                if (selectedPlant?.plant_id === id) {
                    setSelectedPlant(null);
                    setFormData(defaultPlant);
                    setIsEditing(false);
                }
                alert('Plant deleted successfully!');
            } else {
                setError(result.error || 'Failed to delete plant');
            }
        } catch (err) {
            setError('Error deleting plant');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Typography variant='h4'>Plants</Typography>
            <PlantForm handleSubmit={handleCreatePlant} />
            <PlantsList plants={plantList} deletePlant={handleDeletePlant} />
            {/* {error && <Typography variant='body2' style={{ color: 'red' }}>{error}</Typography>} */}
        </>
    )
};