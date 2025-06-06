import { useState } from "react";
import MaterialItem from "./MaterialItem";

const MaterialTest: React.FC = () => {
    const [materialId, setMaterialId] = useState<number | null>(null);
    const materialCreated = (materialId: number) => {
        setMaterialId(materialId);
    };
    return (
        <>
            <MaterialItem 
                materialId={materialId ?? 0} 
                materialCreated={materialCreated} 
                enableRemoveFile={true}
                enableDownloadFile={true}
                enableEdittingMaterialName={true}
                enableAddingFile={true}
                enableEdittingFile={true}
                />
        </>
    );
};

export default MaterialTest;