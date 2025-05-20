// src/components/Test.tsx
import React from 'react';
import { useDatabase } from '../hooks/useDatabase';

interface PlantListProps {
  plants: Plant[];
  deletePlant: (plantId: number) => void;
}

const PlantsList: React.FC<PlantListProps> = ({ plants, deletePlant }) => {

  return (
    <div style={{ padding: '20px' }}>


      <h2>Plants</h2>
      <ul>
        {plants.map((plant) => (
          <li key={plant.plant_id}>
            <div>
              {plant.plant_id} {plant.name}
              <button onClick={() => deletePlant(plant.plant_id!)}>Delete</button>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlantsList;