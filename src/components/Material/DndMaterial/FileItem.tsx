import React from "react";
import { FileDto } from "../../../dtos/FileDto";
import { useDraggable } from '@dnd-kit/core';
interface DndFile{
    fileDto: FileDto,
}
const FileItem: React.FC<DndFile> = ({fileDto}) => {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: fileDto.id.toString()
      });
    const shortedFileName =  (fileDto: FileDto, limit: number = 32) => {
        if (fileDto?.name && fileDto.name.length > limit) {
            return fileDto.name.slice(0, limit) + "...";
        }
        return fileDto?.name;
    }

    const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    return (
        <div className="badge text-bg-secondary p-3  m-1"
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
        >
            {shortedFileName(fileDto, 32)}
        </div>
    )
  }
  export default FileItem