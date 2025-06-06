
import React, { useState } from "react"
import { FileDto } from "../../dtos/FileDto.ts";
import fileService from "../../services/fileService.ts"

import styles from './FileAdd.module.css';
import ErrorMessage from "../ErrorMessage.tsx";

interface FileAddProps {
    materialId: number;
    onFileUploaded: (fileDto: FileDto) => void;
}
const FileAdd: React.FC<FileAddProps> = ({ materialId, onFileUploaded }) => {

    // Obsługa error-ów
    const [errorShow, setErrorShow] = React.useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const randomValue = crypto.randomUUID()
    const [isDragActive, setIsDragActive] = useState(false)

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragActive(true)
    }

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragActive(false)
    }

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragActive(false)
        const files = Array.from(e.dataTransfer.files);
        files.forEach((file) => handleFileUpload(file, materialId));
    }
    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach((file) => handleFileUpload(file, materialId))
        }
    }
    const handleFileUpload = async (file: File, materialIds: number) => {
        if (file) {
            try {
                const response = await fileService.uploadFile(file, materialIds);
                onFileUploaded(response.fileDto)
            }
            catch (error) {
                setErrorMessage("Error uploading file: " + error)
                setErrorShow(true)
            }
        }
    }


    return (
        <div className={`p-3 mt-3 ${styles.dropzone} text-center mb-4 ${isDragActive ? ` ${styles.borderColorOnDrag}` : ''}`}
            onDragOver={(e) => onDragOver(e)}
            onDragLeave={(e) => onDragLeave(e)}
            onDrop={(e) => onDrop(e)}
        >
            <ErrorMessage
                message={errorMessage || 'Undefine error'}
                show={errorShow}
                onHide={() => {
                    setErrorShow(false);
                    setErrorMessage(null);
                }} />
            <div>
                <i className={`bi bi-upload ${styles.uploadIcon} ${isDragActive ? ` ${styles.uploadIconOnDrag}` : ''}`} />
            </div>
            <div className="p-3">
                <p className="text-body-tertiary fs-6 opacity-50 p-0 m-0">Drag and drop file here</p>
                <p className="text-body-tertiary fs-6 opacity-50 p-0 m-0">or</p>
            </div>
            <div>
                <input type="file" className={styles.input} id={`"${randomValue}"`} onChange={(e) => onFileSelected(e)} multiple />
                <label className="btn btn-outline-primary" htmlFor={`"${randomValue}"`}>Browse for file</label>
            </div>
        </div>
    )
}
export default FileAdd;
