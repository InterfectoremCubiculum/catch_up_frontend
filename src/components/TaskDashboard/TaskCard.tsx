import React, {useCallback, useState} from 'react';
import { useDrag } from 'react-dnd';
import { Dropdown } from 'react-bootstrap';
import { FullTaskDto } from '../../dtos/FullTaskDto';
import { ResourceTypeEnum } from '../../Enums/ResourceTypeEnum';
import {AddFeedbackDialog} from "../Feedback/AddFeedbackDialog.tsx";

interface TaskCardProps {
    task: FullTaskDto;
    onEditClick: (task: FullTaskDto) => void;
    onDeleteClick: () => void;
    role: string;
    categoryName?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
                                               task,
                                               onEditClick,
                                               onDeleteClick,
                                               categoryName,
                                               isDisabled = false,
                                               isLoading = false
                                           }) => {
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [{ isDragging }, drag] = useDrag({
        type: 'TASK',
        item: { id: task.id, type: 'existingTask' },
        collect: (monitor : any) => ({
            isDragging: !!monitor.isDragging(),
        }),
        canDrag: !isDisabled
    });

    const formatDate = (dateString?: string) => {
        if (!dateString || new Date(dateString).getFullYear() === 1970) {
            return "No deadline";
        }
        return new Date(dateString).toLocaleDateString();
    };

    const dragRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (node && !isDisabled) {
                drag(node);
            }
        },
        [drag, isDisabled]
    );

    const truncateText = (text: string, maxLength: number) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div
            ref={dragRef}
            className={`task-card card mb-2 shadow-sm ${isDragging ? 'opacity-50' : ''} ${isDisabled ? 'opacity-50' : ''}`}
            style={{
                cursor: isDisabled ? 'not-allowed' : 'grab',
                pointerEvents: isDisabled ? 'none' : 'auto',
            }}
        >
            <div className="card-body p-2">
                <div className="d-flex justify-content-between align-items-start">
                    {isLoading ? (
                        <div className={"fade-animation"}/>
                    ) : (
                        <h6
                            className="card-title mb-2"
                            title={task.title}
                        >
                            {task.title}
                        </h6>
                    )}
                    <Dropdown align="end">
                        <Dropdown.Toggle
                            variant="link"
                            size="sm"
                            id={`dropdown-${task.id}`}
                            className="btn-sm p-0"
                            disabled={isDisabled}
                        >
                            <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{zIndex: 9999}}>
                            <Dropdown.Item onClick={() => onEditClick(task)}>
                                <i className="bi bi-pencil me-2"></i>Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={onDeleteClick}>
                                <i className="bi bi-trash me-2"></i>Delete
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => {
                                    setShowFeedbackDialog(true);
                                }}
                            > <i className="bi bi-chat-square-text me-2"></i>Feedback
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Due: {formatDate(task.deadline)}</small>
                    {categoryName && (
                        <small
                            className="badge bg-info text-white text-truncate"
                            title={categoryName}
                        >
                            {truncateText(categoryName, 15)}
                        </small>
                    )}
                </div>
            </div>

            {showFeedbackDialog && (
                <AddFeedbackDialog
                    resourceId={task.id!}
                    resourceType={ResourceTypeEnum.Task}
                    receiverId={task.assigningId}
                    onClose={() => setShowFeedbackDialog(false)}
                />
            )}

        </div>
    );
};

export default TaskCard;