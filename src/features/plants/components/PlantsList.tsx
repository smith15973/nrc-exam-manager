// src/components/Test.tsx
import { IconButton, List, ListItem, Box, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';



interface PlantListProps {
  plants: Plant[];
  deletePlant: (plantId: number) => void;
  sx?: SxProps
}

export default function PlantsList(props: PlantListProps) {
  const { plants, deletePlant, sx } = props
  return (
    <List sx={sx}>
      {plants.map((plant) => (
        <ListItem
          key={plant.plant_id}
          secondaryAction={
            <IconButton edge='end' aria-label='delete'>
              <ConfirmDelete
                message='Are you sure you want to delete this plant? This action cannot be undone!'
                onConfirmDelete={() => deletePlant(plant.plant_id!)}
                button={({ onClick, disabled }) => (
                  <DeleteIcon
                    onClick={onClick}
                    style={{
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.5 : 1
                    }}
                  />
                )}
              />

            </IconButton>
          }
          divider
          disablePadding
        >
          <ListItemAvatar>
            <Avatar variant='rounded' alt={plant.name} />
          </ListItemAvatar>
          <ListItemButton component={Link} to={`/plants/${plant.plant_id}`}>
            {plant.plant_id} {plant.name}
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};