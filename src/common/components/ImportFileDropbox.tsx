import { Button } from "@mui/material";


export default function ImportFileDropbox() {

    const handleJSONImportClick = async () => {
        const result = await window.files.import.json();
        console.log(result)
    }
    const handleCSVImportClick = async () => {
        const results = await window.files.import.csv();
        console.log(results[0])
    }
    const handleXLSXImportClick = async () => {
        const result = await window.files.import.xlsx();
        console.log(result)
    }

    return (
        <>
            <Button onClick={handleJSONImportClick}>Import JSON Here</Button>
            <Button onClick={handleCSVImportClick}>Import CSV Here</Button>
            <Button onClick={handleXLSXImportClick}>Import XLSX Here</Button>
        </>
    )
}