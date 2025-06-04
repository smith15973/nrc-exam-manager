import React from 'react';
import MultiSelectDialog from '../../../common/components/MultiselectDialog';

interface CheckKasProps {
  selectedIdList: string[];
  kaOptions: Ka[];
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckKas(props: CheckKasProps) {
  const config = {
    label: "Kas",
    placeholder: "Select Kas",
    dialogTitle: "Selected Kas",
    getKey: (ka: Ka) => ka.ka_number,
    getDisplayLabel: (ka: Ka) => ka.ka_description,
    getDisplayText: (ka: Ka) => `${ka.ka_number}-${ka.ka_description}`,
  };

  return (
    <MultiSelectDialog
      selectedIdList={props.selectedIdList}
      options={props.kaOptions}
      config={config}
      handleChange={props.handleChange}
    />
  );
}