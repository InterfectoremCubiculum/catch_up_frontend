import React, { useState, useEffect } from 'react';
import './TaskContentComponent.css';
import { Accordion, Alert, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { TaskContentDto } from '../../dtos/TaskContentDto';
import { getTaskContents, getByTitle, deleteTaskContent } from '../../services/taskContentService';
import Material from '../Material/Material';
import TaskContentEdit from './TaskContentEdit';
import { CategoryDto } from '../../dtos/CategoryDto';
import { getCategories } from '../../services/categoryService';
import { removeTaskFromAllPresets } from '../../services/taskPresetService';
import Loading from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';

interface TaskContentComponentProps {
    isAdmin: boolean;
}

const TaskContentComponent: React.FC<TaskContentComponentProps> = ({ isAdmin }) => {
    const [taskContents, setTaskContents] = useState<TaskContentDto[]>([]);
    const [filteredTaskContents, setFilteredTaskContents] = useState<TaskContentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showError, setShowError] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showSearchMessage, setShowSearchMessage] = useState(false);
    const [searchMessage, setSearchMessage] = useState('alert');
    const [searchTitle, setSearchTitle] = useState('');
    let i = 1;
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [sortOption, setSortOption] = useState<string>('title');
    const [sortDirection, setSortDirection] = useState<string>('asc');
    
    const navigate = useNavigate();

    useEffect(() => {
        getAllTaskContents();
        getCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error('Error loading categories:', error));
    }, []);

    useEffect(() => {
        filterTaskContents();
    }, [taskContents, searchTitle, selectedCategoryId, sortOption, sortDirection]);

    const getAllTaskContents = () => {
        setLoading(true);
        getTaskContents()
            .then((data) => {
                setTaskContents(data);
                setFilteredTaskContents(data);
                setShowSearchMessage(false);
            })
            .catch((error) => {
                setShowError(true);
                setAlertMessage(error.message);
            })
            .finally(() => setLoading(false));
    }

    const filterTaskContents = () => {
        let filtered = taskContents;
        
        // Filter by title
        if (searchTitle) {
            filtered = filtered.filter(content => 
                content.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }
        
        // Filter by category
        if (selectedCategoryId && Number(selectedCategoryId)) {
            filtered = filtered.filter(content => 
                content.categoryId === Number(selectedCategoryId)
            );
        }
        
        // Sort
        if (sortOption) {
            filtered = [...filtered].sort((a, b) => {
                const direction = sortDirection === 'asc' ? 1 : -1;
                switch (sortOption) {
                    case 'title':
                        return direction * (a.title || '').localeCompare(b.title || '');
                    case 'category':
                        const catA = categories.find(cat => cat.id === a.categoryId)?.name || '';
                        const catB = categories.find(cat => cat.id === b.categoryId)?.name || '';
                        return direction * catA.localeCompare(catB);
                    default:
                        return 0;
                }
            });
        }
        
        setFilteredTaskContents(filtered);
    }

    const searchTaskContents = () => {
        filterTaskContents();
    };

    const handleDelete = async (taskContentId: number) => {
        try {
            // console.log('Starting deletion process for taskContentId:', taskContentId);
            
            // console.log('Removing task from all presets...');
            await removeTaskFromAllPresets(taskContentId);
            // console.log('Successfully removed task from all presets');
            
            // console.log('Deleting task content...');
            await deleteTaskContent(taskContentId);
            // console.log('Successfully deleted task content');
            
            getAllTaskContents();
            
        } catch (error: any) {
            console.error('Error in deletion process:', error);
            setShowError(true);
            setAlertMessage('Error deleting TaskContent: ' + error.message);
        }
    };

    const editClick = (taskContentId: number) => {
        navigate(`/taskcontent/edit/${taskContentId}`);
    };

    const handleTaskContentUpdated = async () => {
        try {
            const updatedCategories = await getCategories();
            setCategories(updatedCategories);
        } catch (error) {
            console.error('Error refreshing categories:', error);
        }
        getAllTaskContents();
    };

    const goToCreateTaskContent = () => {
        navigate('/taskcontent/create');
    };

    const materialCreated = (materialId: number) => {
        return materialId;
    }

    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || categoryId;
    };

    const viewDetails = (taskContentId: number) => {
        navigate(`/taskcontent/details/${taskContentId}`);
    };

    const toggleSortDirection = () => {
        setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    };

    return (
        <section className='container'>
            <h2 className='title'>Task Contents</h2>

            {/* Filters and Search */}
            <div className="filter-container">
                <Row className="mb-3">
                    <Col sm={12} md={6} lg={4}>
                        <Form.Group>
                            <Form.Label>Search by title:</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter title..."
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                />
                                <Button variant="primary" onClick={searchTaskContents}>
                                    Search
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    
                    <Col sm={12} md={6} lg={4}>
                        <Form.Group>
                            <Form.Label>Filter by category:</Form.Label>
                            <Form.Select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    
                    <Col sm={12} md={6} lg={4}>
                        <Form.Group>
                            <Form.Label>Sort by:</Form.Label>
                            <Row>
                                <Col sm={8}>
                                    <Form.Select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                    >
                                        <option value="title">Title</option>
                                        <option value="category">Category</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={4}>
                                    <Button 
                                        variant="outline-secondary"
                                        onClick={toggleSortDirection}
                                    >
                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Group>
                    </Col>
                </Row>
            </div>

            {loading && (
                <div className='loaderBox loading'>
                    <Loading/>
                </div>
            )}

            {showSearchMessage && !loading && (
                <Alert variant='warning'>
                    {searchMessage}
                </Alert>
            )}

            {showError && !loading && (
                <Alert variant='danger'>
                    {alertMessage}
                </Alert>
            )}

            {!showSearchMessage && !showError && !loading && (
                <div>
                    <Accordion className='AccordionItem text-start mt-3 mb-3'>
                        {filteredTaskContents.length === 0 ? (
                            <div className="text-center p-3">
                                <p>No task contents found</p>
                            </div>
                        ) : (
                            filteredTaskContents.map((taskContent) => (
                                <Accordion.Item eventKey={taskContent.id.toString()} key={taskContent.id}>
                                    <Accordion.Header>
                                        <strong>{i++}. {taskContent.title}</strong>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {taskContent.categoryId && (
                                            <p className="fs-5 mb-3 task-category">
                                                <span className="badge bg-info">
                                                    {getCategoryName(taskContent.categoryId)}
                                                </span>
                                            </p>
                                        )}

                                        <p className="task-description">{taskContent.description}</p>

                                        {taskContent.materialsId && (
                                            <div>
                                                Additional materials:
                                                <Material materialId={taskContent.materialsId} showDownloadFile={true} materialCreated={materialCreated} />
                                            </div>
                                        )}

                                        <div className='buttonBox d-flex justify-content-between mt-4'>
                                            <Button
                                                variant="success"
                                                onClick={() => viewDetails(taskContent.id)}>
                                                View Details
                                            </Button>
                                            
                                            {isAdmin && (
                                                <div className="admin-buttons">
                                                    <Button
                                                        variant="outline-success"
                                                        onClick={() => editClick(taskContent.id)}
                                                        className="me-2">
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => handleDelete(taskContent.id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))
                        )}
                    </Accordion>
                    
                    {isAdmin && (
                        <div className="d-grid gap-2 col-6 mx-auto">
                            <Button variant="success" onClick={() => goToCreateTaskContent()}>
                                Create new task content
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default TaskContentComponent;
