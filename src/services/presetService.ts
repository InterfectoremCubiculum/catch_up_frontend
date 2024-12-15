import axiosInstance from '../../axiosConfig';
import { PresetDto } from '../dtos/PresetDto';

export const getPresets = async (): Promise<PresetDto[]> => {
    try {
        const response = await axiosInstance.get<PresetDto[]>('/Preset/GetAll');
        return response.data;
    } catch (error: any) {
        handleError('getPresets', error);
        throw error;
    }
};

export const getPresetById = async (id: number): Promise<PresetDto> => {
    try {
        const response = await axiosInstance.get<PresetDto>(`/Preset/GetById/${id}`);
        return response.data;
    } catch (error: any) {
        handleError('getPresetById', error);
        throw error;
    }
};

export const getPresetsByCreatorId = async (creatorId: string): Promise<PresetDto[]> => {
    try {
        const response = await axiosInstance.get<PresetDto[]>(`/Preset/GetByCreatorId/${creatorId}`);
        return response.data;
    } catch (error: any) {
        handleError('getPresetsByCreatorId', error);
        throw error;
    }
};

export const getPresetsByName = async (name: string): Promise<PresetDto[]> => {
    try {
        const response = await axiosInstance.get<PresetDto[]>(`/Preset/GetByName/${name}`);
        return response.data;
    } catch (error: any) {
        handleError('getPresetsByName', error);
        throw error;
    }
};

export const getPresetsByTaskContent = async (taskContentId: number): Promise<PresetDto[]> => {
    try {
        const response = await axiosInstance.get<PresetDto[]>(`/Preset/GetByTaskContent/${taskContentId}`);
        return response.data;
    } catch (error: any) {
        handleError('getPresetsByTaskContent', error);
        throw error;
    }
};

export const searchPresets = async (searchString: string): Promise<PresetDto[]> => {
    try {
        const response = await axiosInstance.get<PresetDto[]>(`/Preset/SearchPresets/${searchString}`);
        return response.data;
    } catch (error: any) {
        handleError('searchPresets', error);
        throw error;
    }
};

export const addPreset = async (preset: PresetDto): Promise<PresetDto> => {
    try {
        console.log('Sending preset data:', preset);
        const response = await axiosInstance.post<PresetDto>('/Preset/Add', preset);
        console.log('Server response:', response);
        return response.data;
    } catch (error: any) {
        console.error('Server error details:', error.response?.data);
        handleError('addPreset', error);
        throw error;
    }
};

export const editPreset = async (preset: PresetDto): Promise<PresetDto> => {
    try {
        const response = await axiosInstance.put<PresetDto>('/Preset/Edit', preset);
        return response.data;
    } catch (error: any) {
        handleError('editPreset', error);
        throw error;
    }
};

export const deletePreset = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/Preset/Delete/${id}`);
    } catch (error: any) {
        handleError('deletePreset', error);
        throw error;
    }
};

const handleError = (operation: string, error: any): void => {
    console.error(`${operation} failed:`, error);
    if (!error.response) {
        throw new Error('API is not available');
    }
    throw new Error(error.response.data?.message || 'An unexpected error occurred');
}; 