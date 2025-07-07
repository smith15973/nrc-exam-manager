import { IconButton, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ListWithSearch from '../../../common/components/ListWithSearch';


interface StemListProps {
    stems: Stem[];
    deleteStem: (stemNum: string) => void;
}

export default function StemsList({ stems, deleteStem }: StemListProps) {

    // Render function for each item
    const renderStem = (stem: Stem, index: number, style: React.CSSProperties) => (
        <ListItem
            style={style}
            key={stem.stem_id}
            secondaryAction={
                <IconButton edge='end' aria-label='delete'>
                    <ConfirmDelete
                        message='Are you sure you want to delete this Stem? This action cannot be undone!'
                        onConfirmDelete={() => deleteStem(stem.stem_id)}
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
            <ListItemButton component={Link} to={`/stems/${stem.stem_id}`}>
                {stem.stem_id} {stem.stem_statement}
            </ListItemButton>
        </ListItem>
    );

    // Search filter function
    const searchFilter = (stem: Stem, searchTerm: string) => {
        return stem.stem_id
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    };

    // Key function for stable list items
    const getItemKey = (stem: Stem, index: number) => stem.stem_id;

    return (
        <ListWithSearch
            data={stems}
            renderItem={renderStem}
            searchFilter={searchFilter}
            searchPlaceholder="Search Stems..."
            itemHeight={56}
            noResultsMessage="No Stems found"
            getItemKey={getItemKey}
        />
    );
}