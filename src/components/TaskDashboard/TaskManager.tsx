import {useEffect, useState} from "react";
import NewbieMentorService from '../../services/newbieMentorService';
import {useAuth} from "../../Provider/authProvider";
import {FullTaskDto} from "../../dtos/FullTaskDto";
import {UserAssignCountDto} from "../../dtos/UserAssignCountDto";
import TaskList from "./TaskList";
import {Button} from "react-bootstrap";
import AssignTask from "../TaskAssigment/AssignTask.tsx";
import {getCategories} from "../../services/categoryService.ts";
import materialService from "../../services/materialService.ts";
import {CategoryDto} from "../../dtos/CategoryDto.ts";
import {MaterialDto} from "../../dtos/MaterialDto.ts";
import {fetchTasks, updateTaskLocally} from "../../store/taskSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store/store.ts";

function TaskManager() {
    const { user } = useAuth();
    const mentorId = user?.id;

    const dispatch: AppDispatch = useDispatch();
    const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);

    const [newbies, setNewbies] = useState<UserAssignCountDto[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<FullTaskDto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNewbie, setSelectedNewbie] = useState<string>("");
    const [showAssignModal, setShowAssignModal] = useState(false);

    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [materials, setMaterials] = useState<MaterialDto[]>([]);

    useEffect(() => {
        const fetchNewbies = async () => {
            if (!mentorId) return;
            try {
                const newbieList = await NewbieMentorService.getAssignmentsByMentor(mentorId);
                setNewbies(newbieList);
            } catch (err) {
                console.error(err);
            }
        };

        fetchNewbies();
    }, []);

    useEffect(() => {
        if (selectedNewbie) {
            const tasksForNewbie = tasks.filter((task) => task.newbieId === selectedNewbie);
            if (tasksForNewbie.length === 0) {
                dispatch(fetchTasks(selectedNewbie));
            }
        }
    }, [selectedNewbie]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, materialsData] = await Promise.all([
                    getCategories(),
                    materialService.getAllMaterials()
                ]);
                setCategories(categoriesData);
                setMaterials(materialsData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    // filter when something changes
    useEffect(() => {
        let updatedTasks = tasks;

        if (selectedNewbie) {
            updatedTasks = updatedTasks.filter((task : FullTaskDto) => task.newbieId === selectedNewbie);
        }

        if (searchTerm.trim()) {
            updatedTasks = updatedTasks.filter((task : FullTaskDto) =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTasks(updatedTasks);
    }, [searchTerm, selectedNewbie, tasks]);

    const handleTaskAssigned = (newTask: FullTaskDto) => {
        dispatch(updateTaskLocally(newTask));
        setShowAssignModal(false);
    };

    const handleTaskUpdate = (updatedTask: FullTaskDto) => {
        dispatch(updateTaskLocally(updatedTask));
    };

    return (
        <div className="container">
            <h2>Task Manager</h2>
            <div className="row mb-3">
                <div className="col-7">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={!selectedNewbie}
                    />
                </div>

                <div className="col-3">
                    <select
                        className="form-select"
                        value={selectedNewbie}
                        onChange={(e) => setSelectedNewbie(e.target.value)}
                    >
                        <option value="">None</option>
                        {newbies.map((newbie) => (
                            <option key={newbie.id} value={newbie.id}>
                                {`${newbie.name} ${newbie.surname}`}
                            </option>
                        ))}
                    </select>
                </div>

                <Button
                    className="col-1"
                    disabled={!selectedNewbie}
                    variant={selectedNewbie ? "primary" : "secondary"}
                    onClick={() => setShowAssignModal(true)}
                >Assign</Button>

                <div className="col-1">
                    <button
                        className="btn btn-outline-secondary w-100"
                        disabled={!selectedNewbie}
                    >
                        Sort
                    </button>
                </div>
            </div>

            {showAssignModal && (
                <AssignTask
                    isEditMode={false}
                    task={null}
                    show={showAssignModal}
                    handleClose={() => setShowAssignModal(false)}
                    onTaskUpdate={handleTaskAssigned}
                    selectedNewbieId={selectedNewbie}
                    categories={categories}
                    materials={materials}
                />
            )}

            <div
                className="border p-3 mt-3"
                style={{
                    minHeight: "600px",
                    maxHeight: "600px",
                    overflowY: "auto"
                }}
            >
                {!selectedNewbie ? (
                    <p className="text-muted">Please select a newbie to view tasks.</p>
                ) : (
                    <TaskList
                        tasks={filteredTasks}
                        loading={loading}
                        onTaskUpdate={handleTaskUpdate}
                        isEditMode={true}
                        categories={categories}
                        materials={materials}
                    />
                )}
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>

    );
}

export default TaskManager;
