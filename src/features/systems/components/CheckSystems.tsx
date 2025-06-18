import React from 'react';
import MultiSelectDialog from '../../../common/components/MultiselectDialog';

interface CheckSystemsProps {
    selectedIdList: string[];
    systemOptions: System[];
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckSystems(props: CheckSystemsProps) {
    const config = {
        label: "Systems",
        placeholder: "Select Systems",
        dialogTitle: "Selected Systems",
        getKey: (system: System) => system.number,
        getDisplayLabel: (system: System) => system.number,
        getDisplayText: (system: System) => `${system.name}`,
    };

    return (
        <MultiSelectDialog
            selectedIdList={props.selectedIdList}
            options={props.systemOptions}
            config={config}
            handleChange={props.handleChange}
        />
    );
}