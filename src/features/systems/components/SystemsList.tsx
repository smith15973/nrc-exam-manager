import { IconButton, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ListWithSearch from '../../../common/components/ListWithSearch';


interface SystemListProps {
    systems: System[];
    deleteSystem: (systemNum: string) => void;
}

export default function SystemsList({ systems, deleteSystem }: SystemListProps) {

    // Render function for each item
    const renderSystem = (system: System, index: number, style: React.CSSProperties) => (
        <ListItem
            style={style}
            key={system.system_number}
            secondaryAction={
                <IconButton edge='end' aria-label='delete'>
                    <ConfirmDelete
                        message='Are you sure you want to delete this System? This action cannot be undone!'
                        onConfirmDelete={() => deleteSystem(system.system_number)}
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
            <ListItemButton component={Link} to={`/systems/${system.system_number}`}>
                {system.system_number} {system.system_name}
            </ListItemButton>
        </ListItem>
    );

    // Search filter function
    const searchFilter = (system: System, searchTerm: string) => {
        return `${system.system_number} ${system.system_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    };

    // Key function for stable list items
    const getItemKey = (system: System) => system.system_number;

    return (
        <ListWithSearch
            data={systems}
            renderItem={renderSystem}
            searchFilter={searchFilter}
            searchPlaceholder="Search Systems..."
            itemHeight={56}
            noResultsMessage="No Systems found"
            getItemKey={getItemKey}
        />
    );
}