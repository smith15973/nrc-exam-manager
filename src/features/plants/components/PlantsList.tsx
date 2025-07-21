import { IconButton, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ListWithSearch from '../../../common/components/ListWithSearch';


interface PlantListProps {
  plants: Plant[];
  deletePlant: (plantId: number) => void;
}

export default function PlantsList({ plants, deletePlant }: PlantListProps) {

    // Render function for each item
    const renderPlant = (plant: Plant, index: number, style: React.CSSProperties) => (
        <ListItem
            style={style}
            key={plant.plant_id}
            secondaryAction={
                <IconButton edge='end' aria-label='delete'>
                    <ConfirmDelete
                        message='Are you sure you want to delete this Plant? This action cannot be undone!'
                        onConfirmDelete={() => deletePlant(plant.plant_id)}
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
            <ListItemButton component={Link} to={`/plants/${plant.plant_id}`}>
                {plant.plant_id} {plant.name}
            </ListItemButton>
        </ListItem>
    );

    // Search filter function
    const searchFilter = (plant: Plant, searchTerm: string) => {
        return `${plant.plant_id} ${plant.name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    };

    // Key function for stable list items
    const getItemKey = (plant: Plant) => plant.plant_id;

    return (
        <ListWithSearch
            data={plants}
            renderItem={renderPlant}
            searchFilter={searchFilter}
            searchPlaceholder="Search Plants..."
            itemHeight={56}
            noResultsMessage="No Plants found"
            getItemKey={getItemKey}
        />
    );
}