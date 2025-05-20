// PlantForm.tsx
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { defaultPlant, plantSchema } from '../lib/schema';

interface PlantFormProps {
    plantId?: number;
}

const PlantsForm: React.FC<PlantFormProps> = ({ plantId }) => {
    const [plant, setPlant] = useState<Plant>(defaultPlant);
    const { addPlant, error, fetchPlant } = useDatabase();

    useEffect(() => {
        if (plantId) {
            fetchPlant(plantId).then((fetchedPlant) => {
                if (fetchedPlant) {
                    setPlant(fetchedPlant);
                }
            });
        }
    }, [plantId, fetchPlant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault;
        if (!plant.name.trim()) return;

        try {
            await addPlant(plant);
            setPlant(defaultPlant);
        } catch (err) {
            // error handled by useDatabase hook
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Plant Management</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name: </label>
                    <input
                        type="text"
                        value={plant.name}
                        onChange={(e) => setPlant({ name: e.target.value })}
                        placeholder='Enter Plant Name'
                        required
                    />
                </div>
                <button type='submit'>Add Plant</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PlantsForm;