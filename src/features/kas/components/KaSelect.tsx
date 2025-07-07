import VirtualizedSelect from "../../../common/components/VirtualizedSelect";

interface KaSelectProps {
  kaNumber: string;
  kas: Ka[];
  handleChange: (key: string, value: string) => void;
}

export default function KaSelect(props: KaSelectProps) {
  const { kaNumber, kas, handleChange } = props;
  const kaNums = kas.map(ka => ka.ka_number);
  
  return (
    <VirtualizedSelect
      value={kaNumber}
      options={kaNums}
      label="KA Numbers"
      fieldKey="ka_number"
      handleChange={handleChange}
      required
    />
  );
}