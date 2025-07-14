import VirtualizedSelect from "../../../common/components/VirtualizedSelect";

interface System {
  system_number: string;
  system_name: string;
}

interface SystemSelectProps {
  systemNumber: string;
  systems: System[];
  handleChange: (key: string, value: string) => void;
}

export default function SystemSelect(props: SystemSelectProps) {
  const { systemNumber, systems, handleChange } = props;
  
  // Create options with label and value
  const systemOptions = systems.map(system => ({
    label: `${system.system_number} - ${system.system_name}`,
    value: system.system_number
  }));

  return (
    <VirtualizedSelect
      value={systemNumber}
      options={systemOptions}
      label="System Numbers"
      fieldKey="system_number"
      handleChange={handleChange}
      required
    />
  );
}