import { Button } from "@mui/material";


export default function ImportFileDropbox() {

    const handleImportClick = async () => {
        const result = await window.files.import.questions();
        console.log(result)
    }
    

    return (
        <>
            <Button onClick={handleImportClick}>Import Here</Button>
        </>
    )
}