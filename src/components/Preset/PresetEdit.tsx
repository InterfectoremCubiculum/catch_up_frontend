import React, { useState, useEffect } from 'react';
import { PresetDto } from '../../dtos/PresetDto';
import { TaskContentDto } from '../../dtos/TaskContentDto';
import { TaskPresetDto } from '../../dtos/TaskPresetDto';
import { Button, Form } from 'react-bootstrap';
import { getTaskContents } from '../../services/taskContentService';
import { addPreset, editPreset } from '../../services/presetService';
import { addTaskPreset } from '../../services/taskPresetService';
import { Autocomplete, TextField, Chip } from '@mui/material';
import './PresetEdit.css';

interface PresetEditProps {
    preset?: PresetDto;
    isEditMode: boolean;
    onPresetEdited: () => void;
    existingTaskContents?: TaskPresetDto[];
}

const PresetEdit: React.FC<PresetEditProps> = ({ preset, isEditMode, onPresetEdited, existingTaskContents = [] }) => {
    const [name, setName] = useState<string>('');
    const [selectedTasks, setSelectedTasks] = useState<TaskContentDto[]>([]);
    const [availableTasks, setAvailableTasks] = useState<TaskContentDto[]>([]);
    const [creatorId, setCreatorId] = useState<string>(''); // To będzie pobierane z kontekstu auth

    useEffect(() => {
        if (preset) {
            setName(preset.name);
            setCreatorId(preset.creatorId);
        }
        loadAvailableTasks();
    }, [preset]);

    const loadAvailableTasks = async () => {
        try {
            const tasks = await getTaskContents();
            // Filtrowanie tasków, które już są w presecie
            const existingTaskIds = existingTaskContents?.map(tp => tp.taskContentId) || [];
            const filteredTasks = tasks.filter(task => !existingTaskIds.includes(task.id));
            setAvailableTasks(filteredTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            console.log('Submitting preset with data:', {
                name,
                creatorId,
                selectedTasks
            });

            const presetDto: PresetDto = {
                id: isEditMode ? preset!.id : 0,
                name: name,
                creatorId: creatorId || 'default-creator' // Tymczasowo
            };

            console.log('PresetDto to be sent:', presetDto);

            const savedPreset = isEditMode 
                ? await editPreset(presetDto)
                : await addPreset(presetDto);

            console.log('Saved preset:', savedPreset);

            // Dodawanie powiązań task-preset tylko jeśli są wybrane taski
            if (selectedTasks.length > 0) {
                for (const task of selectedTasks) {
                    const taskPresetDto: TaskPresetDto = {
                        presetId: savedPreset.id,
                        taskContentId: task.id
                    };
                    
                    console.log('Adding task-preset relation:', taskPresetDto);
                    await addTaskPreset(taskPresetDto);
                }
            }

            onPresetEdited();
            if (!isEditMode) {
                setName('');
                setSelectedTasks([]);
            }
        } catch (error) {
            console.error('Error details:', error);
            alert('Failed to save preset. Check console for details.');
        }
    };

    return (
        <section className='editBox'>
            <Form onSubmit={handleSubmit}>
                <h2>{isEditMode ? 'Edit Preset' : 'Create New Preset'}</h2>
                
                <Form.Group className="mb-3">
                    <Form.Label>Preset Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Select Tasks</Form.Label>
                    <Autocomplete
                        multiple
                        options={availableTasks}
                        getOptionLabel={(option) => option.title}
                        value={selectedTasks}
                        onChange={(_, newValue) => setSelectedTasks(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Select tasks..."
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.title}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                    />
                </Form.Group>

                <Button type="submit" variant="primary">
                    {isEditMode ? 'Save Changes' : 'Create Preset'}
                </Button>
            </Form>
        </section>
    );
};

export default PresetEdit; 