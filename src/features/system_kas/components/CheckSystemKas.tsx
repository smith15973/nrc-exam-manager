import React from 'react';
import MultiSelectDialog from '../../../common/components/MultiselectDialog';

interface CheckSystemKasProps {
  selectedIdList: string[];
  system_kaOptions: SystemKa[];
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckSystemKas(props: CheckSystemKasProps) {
  const config = {
    label: "SystemKas",
    placeholder: "Select SystemKas",
    dialogTitle: "Selected SystemKas",
    getKey: (system_ka: SystemKa) => system_ka.system_ka_number,
    getDisplayLabel: (system_ka: SystemKa) => system_ka.system_ka_number,
    getDisplayText: (system_ka: SystemKa) => `${system_ka.system_ka_number}`,
  };

  return (
    <MultiSelectDialog
      selectedIdList={props.selectedIdList}
      options={props.system_kaOptions}
      config={config}
      handleChange={props.handleChange}
    />
  );
}