import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const columns: GridColDef<Question>[] = [
    {
        field: 'question_text',
        headerName: 'Question',
        width: 150,
    },
    {
        field: 'systems',
        headerName: 'Systems',
        width: 150,
        valueGetter: (value, row) => row.systems?.map(system => `${system.number}-${system.name}`).join(', '),
        // Custom sort for systems - sorts by first system number
        sortComparator: (v1, v2, param1, param2) => {
            const row1 = param1.api.getRow(param1.id);
            const row2 = param2.api.getRow(param2.id);
            const firstSystem1 = row1?.systems?.[0]?.number || 0;
            const firstSystem2 = row2?.systems?.[0]?.number || 0;
            return firstSystem1 - firstSystem2;
        }
    },
    {
        field: 'kas',
        headerName: 'KA#s',
        type: 'number',
        width: 150,
        valueGetter: (value, row) => row.kas?.map(ka => `${ka.ka_number}-${ka.ka_description}`).join(', '),
        sortComparator: (v1, v2, param1, param2) => {
            const row1 = param1.api.getRow(param1.id);
            const row2 = param2.api.getRow(param2.id);
            const firstKa1 = row1?.kas?.[0]?.ka_number || 0;
            const firstKa2 = row2?.kas?.[0]?.ka_number || 0;
            return firstKa1 - firstKa2;
        }
    },
    {
        field: 'last_used',
        headerName: 'Last Used',
        sortable: false,
        width: 150,
        // valueGetter: (value, row) => ${row.firstName || ''} ${row.lastName || ''},*/
    },
];
interface QuestionTableProps {
    questions: Question[];
    checkable?: true | boolean;
    selectedIds?: number[];
    onSelectionChange?: (selectedIds: number[]) => void;
}

export default function QuestionsTable(props: QuestionTableProps) {
    const { questions, checkable = false, selectedIds = [], onSelectionChange } = props;
    const navigate = useNavigate();

    const [selectedModel, setSelectedModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set(selectedIds) });

    useEffect(() => {
        setSelectedModel({ type: 'include', ids: new Set(selectedIds) })
    }, [selectedIds.join(',')])

    const handleSelectionModelChange = (itm: GridRowSelectionModel) => {
        const idsSet = new Set(itm.ids)
        if (onSelectionChange) {
            onSelectionChange(Array.from(idsSet) as number[]);
        }
    }

    return (
        <Box sx={{ height: 600, width: '100%', pt: 2 }}>
            <DataGrid
                getRowId={(row) => row.question_id}
                rows={questions}
                columns={columns}
                // initialState={{
                //     pagination: {
                //         paginationModel: {
                //             pageSize: 5,
                //         },
                //     },
                // }}
                pageSizeOptions={[5]}
                checkboxSelection={checkable}
                disableRowSelectionOnClick
                rowSelectionModel={selectedModel}
                onRowSelectionModelChange={handleSelectionModelChange}
                onRowClick={(params) => {
                    navigate(`/questions/${params.row.question_id}`);
                }}
            />
        </Box>
    );
}