export interface TaskDto {
    id?: number;
    newbieId?: string;
    taskContentId: number;
    roadMapPointId?: string | null;
    status: number;
    assignmentDate?: string;
    finalizationDate?: string | null;
    deadline: string;
    spendTime?: number;
    priority: number;
    rate?: number | null;
}