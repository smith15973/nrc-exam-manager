// src/components/Test.tsx
import React from 'react';
import { IconButton, List, ListItem, Typography, Box, ListItemButton, ListItemAvatar, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


interface PlantListProps {
  plants: Plant[];
  deletePlant: (plantId: number) => void;
}

const PlantsList: React.FC<PlantListProps> = ({ plants, deletePlant }) => {

  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant='h4'>Plants</Typography>
      <List>
        {plants.map((plant) => (
          <ListItem
            key={plant.plant_id}
            secondaryAction={
              <IconButton edge='end' aria-label='delete'>
                <DeleteIcon onClick={() => deletePlant(plant.plant_id!)} />
              </IconButton>
            }
            divider
            disablePadding
          >
            <ListItemAvatar>
              <Avatar variant='rounded' alt={plant.name} />
            </ListItemAvatar>
            <ListItemButton>
              {plant.name}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PlantsList;