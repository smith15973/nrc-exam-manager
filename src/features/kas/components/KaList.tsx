import { IconButton, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ListWithSearch from '../../../common/components/ListWithSearch';


interface KaListProps {
    kas: Ka[];
    deleteKa: (kaNum: string) => void;
}

export default function KasList({ kas, deleteKa }: KaListProps) {

    // Render function for each item
    const renderKa = (ka: Ka, index: number, style: React.CSSProperties) => (
        <ListItem
            style={style}
            key={ka.ka_number}
            secondaryAction={
                <IconButton edge='end' aria-label='delete'>
                    <ConfirmDelete
                        message='Are you sure you want to delete this KA? This action cannot be undone!'
                        onConfirmDelete={() => deleteKa(ka.ka_number)}
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
            <ListItemButton component={Link} to={`/kas/${ka.ka_number}`}>
                {ka.ka_number} {ka.stem_id}
            </ListItemButton>
        </ListItem>
    );

    // Search filter function
    const searchFilter = (ka: Ka, searchTerm: string) => {
        return ka.ka_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    };

    // Key function for stable list items
    const getItemKey = (ka: Ka, index: number) => ka.ka_number;

    return (
        <ListWithSearch
            data={kas}
            renderItem={renderKa}
            searchFilter={searchFilter}
            searchPlaceholder="Search KAs..."
            itemHeight={56}
            noResultsMessage="No KAs found"
            getItemKey={getItemKey}
        />
    );
}