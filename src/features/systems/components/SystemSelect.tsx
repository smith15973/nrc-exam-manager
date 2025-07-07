import VirtualizedSelect from "../../../common/components/VirtualizedSelect";

interface SystemSelectProps {
  systemNumber: string;
  systems: System[];
  handleChange: (key: string, value: string) => void;
}

export default function SystemSelect(props: SystemSelectProps) {
  const { systemNumber, systems, handleChange } = props;
  const systemNums = systems.map(system => system.system_number);
  
  return (
    <VirtualizedSelect
      value={systemNumber}
      options={systemNums}
      label="System Numbers"
      fieldKey="system_number"
      handleChange={handleChange}
      required
    />
  );
}