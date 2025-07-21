import { IconButton, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ListWithSearch from '../../../common/components/ListWithSearch';


interface SystemKaListProps {
  system_kas: SystemKa[];
  deleteSystemKa: (system_kaNum: string) => void;
}

export default function SystemKasList({ system_kas, deleteSystemKa }: SystemKaListProps) {
  
  // Render function for each item
  const renderSystemKa = (system_ka: SystemKa, index: number, style: React.CSSProperties) => (
    <ListItem
      style={style}
      secondaryAction={
        <IconButton edge="end" aria-label="delete">
          <ConfirmDelete
            message="Are you sure you want to delete this KA? This action cannot be undone!"
            onConfirmDelete={() => deleteSystemKa(system_ka.system_ka_number)}
            button={({ onClick, disabled }) => (
              <DeleteIcon
                onClick={onClick}
                style={{
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                }}
              />
            )}
          />
        </IconButton>
      }
      divider
      disablePadding
    >
      <ListItemButton component={Link} to={`/system_kas/${system_ka.system_ka_number}`}>
        {system_ka.system_ka_number} {system_ka.category}
      </ListItemButton>
    </ListItem>
  );

  // Search filter function
  const searchFilter = (system_ka: SystemKa, searchTerm: string) => {
    return `${system_ka.system_ka_number} ${system_ka.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  };

  // Key function for stable list items
  const getItemKey = (system_ka: SystemKa) => system_ka.system_ka_number;

  return (
    <ListWithSearch
      data={system_kas}
      renderItem={renderSystemKa}
      searchFilter={searchFilter}
      searchPlaceholder="Search system KAs..."
      itemHeight={56}
      noResultsMessage="No system KAs found"
      getItemKey={getItemKey}
    />
  );
}